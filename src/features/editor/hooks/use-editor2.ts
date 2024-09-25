import { fabric } from 'fabric'
import { useCallback, useState, useMemo, useRef, useEffect } from "react"
import { useAutoResize } from './use-auto-resize'
import { ActiveToolItem, BuildEditorProps, CIRCLE_OPTIONS, Editor } from '../types'
import { v4 as uuidv4 } from 'uuid';


const buildEditor = ({
    canvas,
}: BuildEditorProps): Editor => {

    const getWorkspace = () => {
        return canvas
            .getObjects()
            .find((object) => object.name === "clip");
    };

    const center = (object: fabric.Object) => {
        const workspace = getWorkspace();
        const center = workspace?.getCenterPoint();

        if (!center) return;

        // @ts-ignore
        canvas._centerObject(object, center);
    };

    const addToCanvas = (object: fabric.Object) => {
        center(object);
        canvas.add(object);
        canvas.setActiveObject(object);
    };

    return {
        addCircle: () => {
            const object = new fabric.Circle({
                ...CIRCLE_OPTIONS,
            });

            addToCanvas(object);
        },
    }
}

interface PositionPoint {
    position: string | undefined;
    name: string | undefined;
    x: number;
    y: number;
    type: string | undefined
}

interface PositionLine {
    // 起点uuid
    fromName: string;
    // 终点uuid
    toName: string;

    lineId: string;
}

export const useEditor = (
    activeToolItem: string,
    setPopoverVisible: any,
    setPopoverPosition: any,
    linePoint: String,
    fromPosition: any,
    setFromPosition: any,
    setLinePoint: any,
    handleOpenPopover: any,
    positionLineArray: PositionLine[],
    positionPointArray: PositionPoint[],
    setPositionPointArray: any,
    setPositionLineArray: any,
    onChangeActiveTool: any,
    onChangeActiveToolItem: any,
    initialContainer: HTMLDivElement
) => {
    const [canvas, setCanvas] = useState<fabric.Canvas | null>(null)
    const [container, setContainer] = useState<HTMLDivElement | null>(null)
    const isDragging = useRef(false);  // 用于记录是否正在拖拽
    const lastPosX = useRef(0);        // 用于记录上一次鼠标的X坐标
    const lastPosY = useRef(0);        // 用于记录上一次鼠标的Y坐标
    const mouseDownHandlerRef = useRef<any>(null); // 用来保存事件处理函数的引用
    const startCircleRef = useRef<fabric.Circle | null>(null); // 用于保存起点的circle

    const editor = useMemo(() => {
        if (canvas) {
            return buildEditor({
                canvas,
            });
        }

        return undefined;
    },
        [
            canvas,
        ]);

    const init = useCallback(({
        initialCanvas,
        initialContainer,
        mainContainer,
        activeToolItem,
    }: {
        initialCanvas: fabric.Canvas
        initialContainer: HTMLDivElement
        mainContainer: HTMLDivElement,
        activeToolItem: ActiveToolItem,
    }) => {
        fabric.Object.prototype.set({
            cornerColor: '#FFF',
            cornerStyle: 'circle',
            borderColor: '#3b82f6',
            borderScaleFactor: 1.5,
            transparentCorners: false,
            borderOpacityWhenMoving: 1,
            cornerStrokeColor: "#3b82f6"
        })

        const initialWorkspace = new fabric.Rect({
            width: initialContainer.offsetWidth,
            height: initialContainer.offsetHeight,
            name: 'clip',
            fill: 'white',
            selectable: false,
            hasControls: false,
            shadow: new fabric.Shadow({
                color: "rgba(0,0,0,0.8)",
                blur: 5
            }),
        })


        // initialCanvas.add(initialWorkspace)
        // initialCanvas.centerObject(initialWorkspace)
        // initialCanvas.clipPath = initialWorkspace

        setCanvas(initialCanvas)
        setContainer(initialContainer)

        // 图片的相对路径
        var imageUrl = '/layer.png';

        const img = new Image();
        img.src = imageUrl

        // 新的鼠标事件逻辑
        const handleMouseDown = (event: MouseEvent) => {

            if (initialCanvas.getActiveObject()) {
                isDragging.current = false;
                initialCanvas.selection = true;

                return
            }

            isDragging.current = true;
            lastPosX.current = event.clientX;
            lastPosY.current = event.clientY;

            initialCanvas.selection = false;

            // event.preventDefault();

        };

        const handleMouseMove = (event: MouseEvent) => {
            if (isDragging.current && mainContainer) {
                const dx = event.clientX - lastPosX.current;
                const dy = event.clientY - lastPosY.current;

                mainContainer.scrollLeft -= dx;
                mainContainer.scrollTop -= dy;

                lastPosX.current = event.clientX;
                lastPosY.current = event.clientY;
            }
        };

        const handleMouseUp = () => {
            isDragging.current = false;
            initialCanvas.selection = true;

        };


        // 绑定新的原生事件监听器
        document.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);


        // 清除事件监听器的逻辑可以在组件卸载时处理
        return () => {
            document.removeEventListener('mousedown', handleMouseDown);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [])

    useEffect(() => {

        if (canvas) {

            const handleMouseDown = mouseDownHandlerRef.current;

            if (activeToolItem === "circle") {
                if (!handleMouseDown) {
                    // 事件处理函数不存在时，添加事件处理程序
                    const newHandler = (event: any) => {
                        if (activeToolItem === "circle") {

                            const pointer = canvas.getPointer(event.e);

                            const uuid = uuidv4()
                            const circle = new fabric.Circle({
                                name: uuid,
                                left: pointer.x - 20,
                                top: pointer.y - 20,
                                radius: 20,
                                fill: 'blue',
                            });

                            canvas.add(circle);

                            const newPositionPoint = {
                                position: "",
                                name: uuid,
                                x: pointer.x - 20,
                                y: pointer.y - 20,
                                type: "circle"
                            }

                            positionPointArray.push(newPositionPoint)

                            if (linePoint === "linePoint") {
                                // const newPoint = {
                                //     x: pointer.x,
                                //     y: pointer.y
                                // }

                                // if (Math.abs((fromPosition.x - pointer.x)) < 10) {
                                //     newPoint.x = fromPosition.x
                                // }

                                // if (Math.abs((fromPosition.y - pointer.y)) < 10) {
                                //     newPoint.y = fromPosition.y
                                // }

                                // const newLine = new fabric.Line([fromPosition.x, fromPosition.y, newPoint.x, newPoint.y], {
                                //     stroke: "#000000",
                                //     strokeWidth: 5,
                                // });
                                // canvas.add(newLine);
                                // linePoint = ""

                                if (startCircleRef.current) {
                                    const pointer = canvas.getPointer(event.e);
                                    const endCircle = canvas.findTarget(event.e, false) as fabric.Circle;

                                    if (endCircle && endCircle !== startCircleRef.current) {
                                        const startX = startCircleRef.current.left! + startCircleRef.current.radius!;
                                        const startY = startCircleRef.current.top! + startCircleRef.current.radius!;
                                        const endX = endCircle.left! + endCircle.radius!;
                                        const endY = endCircle.top! + endCircle.radius!;

                                        const newPoint = {
                                            x: endX,
                                            y: endY
                                        }

                                        if (Math.abs((startX - endX)) < 10) {
                                            newPoint.x = startX
                                        }

                                        if (Math.abs((startY - endY)) < 10) {
                                            newPoint.y = endY
                                        }

                                        const lineId = uuidv4()

                                        const line = new fabric.Line([startX, startY, newPoint.x, newPoint.y], {
                                            name: lineId,
                                            stroke: "#FF0000",
                                            strokeWidth: 5,
                                        });

                                        positionLineArray.push({
                                            'fromName': startCircleRef.current.name!,
                                            'toName': uuid,
                                            'lineId': lineId
                                        })

                                        console.log("positionLineArray")
                                        console.log(positionLineArray)

                                        canvas.add(line);
                                        startCircleRef.current = null; // 清除起点
                                        setLinePoint(""); // 重置连线状态
                                    }
                                }
                            }
                        }
                    };

                    mouseDownHandlerRef.current = newHandler;
                    canvas.on('mouse:down', newHandler);
                }
            } else {
                if (handleMouseDown) {
                    // 事件处理函数存在时，移除事件处理程序
                    console.log("Removing handleMouseDown");
                    canvas.off('mouse:down', handleMouseDown);
                    mouseDownHandlerRef.current = null; // 清空引用
                }
            }


            // 单击事件处理
            const handleObjectSelected = (event: any) => {
                const target = event.target;
                if (target) {
                    canvas.setActiveObject(target);  // 设置为选中对象
                }
            };

            // 双击事件处理
            const handleObjectDblClick = (event: fabric.IEvent) => {
                const pointer = canvas.getPointer(event.e);
                const target = event.target as fabric.Circle;
                if (target && target === canvas.getActiveObject()) {
                    // 在这里实现弹出层的逻辑
                    console.log('Double clicked on:', target);
                    startCircleRef.current = target;

                    // 显示弹出层的代码，可以是模态框、提示框等
                    setPopoverPosition({ x: target.left!, y: target.top! });
                    setFromPosition({ x: target.left!, y: target.top! });
                    // setPopoverVisible(true);

                    handleOpenPopover()
                }
            };

            // 监听对象的单击和双击事件
            canvas.on('mouse:down', handleObjectSelected);
            canvas.on('mouse:dblclick', handleObjectDblClick);
            canvas.on('mouse:up', () => {
                canvas.setViewportTransform(canvas?.viewportTransform!);
            });

            canvas.on('mouse:wheel', function (opt) {
                // let delta = opt.e.deltaY;
                // let zoom = canvas.getZoom();
                // zoom *= 0.999 ** delta;

                // if (zoom > 20) zoom = 20;
                // if (zoom < 0.01) zoom = 0.01;

                // const center = canvas.getVpCenter();
                // const x = center.x * zoom;
                // const y = center.y * zoom;

                // canvas.zoomToPoint(new fabric.Point(x, y), zoom);
                // opt.e.preventDefault();
                // opt.e.stopPropagation();

                // const delta = opt.e.deltaY;
                // let zoom = canvas.getZoom();
                // zoom *= 0.999 ** delta;
                // if (zoom > 20) zoom = 20;
                // if (zoom < 0.01) zoom = 0.01;
                // canvas.setZoom(zoom);

                // // 计算新的偏移量以居中显示
                // const canvasWidth = canvas.getWidth();
                // const canvasHeight = canvas.getHeight();
                // const imgWidth = canvasWidth * zoom;
                // const imgHeight = canvasHeight * zoom;

                // const vpt = canvas.viewportTransform;
                // vpt![4] = (canvasWidth - imgWidth) / 2; // 水平方向居中
                // vpt![5] = (canvasHeight - imgHeight) / 2; // 垂直方向居中

                // canvas.requestRenderAll();
                // opt.e.preventDefault();
                // opt.e.stopPropagation();

                var delta = opt.e.deltaY;
                var zoom = canvas.getZoom();
                zoom *= 0.999 ** delta;
                if (zoom > 20) zoom = 20;
                if (zoom < 0.01) zoom = 0.01;
                canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
                opt.e.preventDefault();
                opt.e.stopPropagation();

                // 自动调整视口位置，保持画布居中
                var vpt = canvas.viewportTransform;

                // 根据放大比例动态调整canvas的宽高
                var canvasWidth = canvas.getWidth();
                var canvasHeight = canvas.getHeight();
                var newWidth = canvasWidth * zoom;
                var newHeight = canvasHeight * zoom;

                console.log({
                    newWidth,
                    newHeight,
                    canvasWidth,
                    canvasHeight,
                    zoom
                })

                // 设置 canvas 的宽高为放大后的尺寸
                // canvas.setWidth(newWidth);
                // canvas.setHeight(newHeight);

                // initialContainer.style.width = newWidth + 'px'
                // initialContainer.style.height = newHeight + 'px'
                initialContainer.scrollTop -= opt.e.deltaY;

                if (zoom < 1) {
                    // vpt![4] = canvas.getWidth() / 2 - canvas.getWidth() / 2 * zoom;
                    // vpt![5] = canvas.getHeight() / 2 - canvas.getHeight() / 2 * zoom;
                    vpt![4] = Math.max(vpt![4], 0); // Don't allow offset above canvas top
                    vpt![5] = Math.max(vpt![5], 0); // Don't allow offset above canvas top
                } else {
                    if (vpt![4] >= 0) vpt![4] = 0;
                    if (vpt![5] >= 0) vpt![5] = 0;
                    if (vpt![4] + canvas.getWidth() * zoom <= canvas.getWidth()) vpt![4] = canvas.getWidth() - canvas.getWidth() * zoom;
                    if (vpt![5] + canvas.getHeight() * zoom <= canvas.getHeight()) vpt![5] = canvas.getHeight() - canvas.getHeight() * zoom;
                }
                canvas.requestRenderAll();
            });

            fabric.Image.fromURL('/layer.png', function (img) {
                // 保证背景图1:1铺满容器
                canvas.setWidth(img.width! / 2)
                canvas.setHeight(img.height! / 2)
                canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
                    left: img.width! / 2, // 鼠标x轴坐标
                    top: img.height! / 2, // 鼠标y轴坐标
                    originX: 'center',
                    originY: 'center',
                })
            })


            // 清除事件监听器的逻辑在组件卸载时处理
            return () => {
                canvas.off('mouse:down', handleObjectSelected);
                canvas.off('mouse:dblclick', handleObjectDblClick);
            };
        }
    }, [activeToolItem, canvas, linePoint]);

    // 监听删除键的按键事件llll
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            const activeObject = canvas?.getActiveObject();
            if (activeObject && (event.key === 'Delete')) {

                // TODO: positionPointArray中删除对应的图形
                const objectId: string = activeObject.name!
                console.log('Delete', objectId)

                let removeIndex = -1
                for (let i = 0; i < positionPointArray.length; i++) {
                    if (positionPointArray[i].name == objectId) {
                        removeIndex = i
                    }
                }

                if (removeIndex >= 0) {
                    positionPointArray.splice(removeIndex, 1)
                }

                let removeLineIndex = -1
                for (let j = 0; j < positionLineArray.length; j++) {
                    if (positionLineArray[j].lineId == objectId) {
                        removeLineIndex = j
                    }
                }

                if (removeLineIndex >= 0) {
                    positionLineArray.splice(removeLineIndex, 1)
                }

                canvas?.remove(activeObject);
                canvas?.discardActiveObject();
                canvas?.requestRenderAll();
            }

            if (event.key === 'Escape' || event.key === 'Esc') {
                console.log('ESC key was pressed!');

                onChangeActiveTool("select")
                onChangeActiveToolItem("select")
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [canvas, positionPointArray, positionLineArray]);

    return { init, editor }
}