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

    const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
    const [scale, setScale] = useState(1); // Canvas的缩放比例
    const [isCanvasReady, setIsCanvasReady] = useState(false); const [container, setContainer] = useState<HTMLDivElement | null>(null)
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

        if (initialCanvas) {

            console.log(initialCanvas)

            setCanvas(initialCanvas);
            // 标记Canvas已经准备好
            setIsCanvasReady(true);



            // 添加背景图片并平铺

            // fabric.Image.fromURL('/png_1001.png', (img) => {
            //     const imgWidth = img.width!;
            //     const imgHeight = img.height!;

            //     // 创建一个临时canvas来绘制图案
            //     const patternSourceCanvas = document.createElement('canvas');
            //     patternSourceCanvas.width = imgWidth;
            //     patternSourceCanvas.height = imgHeight;
            //     const patternSourceCtx = patternSourceCanvas.getContext('2d');

            //     // 在临时canvas上绘制图像
            //     if (patternSourceCtx) {
            //         patternSourceCtx.drawImage(img.getElement(), 0, 0);
            //         const patternDataURL = patternSourceCanvas.toDataURL();

            //         fabric.Image.fromURL(patternDataURL, (patternImage) => {
            //             const pattern = new fabric.Pattern({
            //                 source: patternImage.getElement() as HTMLImageElement, // 使用fabric.Image对象的元素作为图案来源
            //                 repeat: 'no-repeat' // 确保图案重复填充整个Canvas
            //             });

            //             if (isCanvasReady && initialCanvas) {
            //                 // 根据实际需求设置 Canvas 大小
            //                 const canvasWidth = window.innerWidth; // 设置为视窗宽度
            //                 const canvasHeight = window.innerHeight; // 设置为视窗高度

            //                 initialCanvas.setWidth(canvasWidth);
            //                 initialCanvas.setHeight(canvasHeight);

            //                 // 设置背景图像
            //                 initialCanvas.setBackgroundColor(pattern, () => {
            //                     initialCanvas.renderAll();
            //                 });


            //             }
            //         });
            //     }
            // });

            fabric.Image.fromURL('/layer3.png', (img) => {
                const imgWidth = img.width!;
                const imgHeight = img.height!;
                const maxWidth = 2048; // 每个块的最大宽度
                const maxHeight = 2048; // 每个块的最大高度

                const cols = Math.ceil(imgWidth / maxWidth);
                const rows = Math.ceil(imgHeight / maxHeight);

                const patternSourceCanvas = document.createElement('canvas');
                patternSourceCanvas.width = maxWidth;
                patternSourceCanvas.height = maxHeight;
                const patternSourceCtx = patternSourceCanvas.getContext('2d');

                if (patternSourceCtx) {
                    const promises: Promise<fabric.Image>[] = [];
                    for (let row = 0; row < rows; row++) {
                        for (let col = 0; col < cols; col++) {
                            const x = col * maxWidth;
                            const y = row * maxHeight;
                            const tileWidth = Math.min(maxWidth, imgWidth - x);
                            const tileHeight = Math.min(maxHeight, imgHeight - y);

                            patternSourceCtx.clearRect(0, 0, maxWidth, maxHeight);
                            patternSourceCtx.drawImage(img.getElement(), x, y, tileWidth, tileHeight, 0, 0, tileWidth, tileHeight);

                            const patternDataURL = patternSourceCanvas.toDataURL();
                            promises.push(
                                new Promise((resolve) => {
                                    fabric.Image.fromURL(patternDataURL, (tileImage) => {
                                        resolve(tileImage as fabric.Image);
                                    });
                                })
                            );
                        }
                    }

                    Promise.all(promises).then((tiles) => {
                        // 处理所有图块，创建一个大的图案
                        const patternCanvas = document.createElement('canvas');
                        const patternCtx = patternCanvas.getContext('2d');
                        patternCanvas.width = imgWidth;
                        patternCanvas.height = imgHeight;

                        if (patternCtx) {
                            for (let row = 0; row < rows; row++) {
                                for (let col = 0; col < cols; col++) {
                                    const tile = tiles[row * cols + col] as fabric.Image;
                                    const x = col * maxWidth;
                                    const y = row * maxHeight;
                                    patternCtx.drawImage(tile.getElement(), x, y);
                                }
                            }

                            const patternImage = new fabric.Image(patternCanvas, { selectable: false });
                            const pattern = new fabric.Pattern({
                                source: patternImage.getElement() as HTMLImageElement,
                                repeat: 'no-repeat'
                            });

                            if (isCanvasReady && initialCanvas) {
                                //                 // 根据实际需求设置 Canvas 大小
                                const canvasWidth = window.innerWidth; // 设置为视窗宽度
                                const canvasHeight = window.innerHeight; // 设置为视窗高度

                                initialCanvas.setWidth(canvasWidth);
                                initialCanvas.setHeight(canvasHeight);

                                // 设置背景图像
                                initialCanvas.setBackgroundColor(pattern, () => {
                                    initialCanvas.renderAll();
                                });
                            }
                        }
                    });
                }
            });







            // 添加图形
            if (initialCanvas) {

                // Mouse down event
                initialCanvas.on('mouse:down', (opt) => {
                    const evt = opt.e;
                    isDragging.current = true;
                    lastPosX.current = evt.clientX;
                    lastPosY.current = evt.clientY;
                    initialCanvas.selection = false;
                    initialCanvas.forEachObject((obj) => {
                        obj.selectable = false;
                    });

                });

                // Mouse move event
                initialCanvas.on('mouse:move', (opt) => {
                    if (isDragging.current) {
                        const evt = opt.e;
                        const vpt = initialCanvas.viewportTransform!;
                        vpt[4] += (evt.clientX - lastPosX.current) / scale;
                        vpt[5] += (evt.clientY - lastPosY.current) / scale;
                        initialCanvas.requestRenderAll();
                        lastPosX.current = evt.clientX;
                        lastPosY.current = evt.clientY;
                    }
                });

                // Mouse up event
                initialCanvas.on('mouse:up', () => {
                    isDragging.current = false;
                    initialCanvas.selection = true;
                    initialCanvas.forEachObject((obj) => {
                        obj.selectable = true;
                    });
                });

                // Mouse wheel event for zooming
                initialCanvas.on('mouse:wheel', function (opt) {
                    var delta = opt.e.deltaY;
                    var zoom = initialCanvas.getZoom();
                    zoom *= 0.999 ** delta;
                    if (zoom > 20) zoom = 20;
                    if (zoom < 0.01) zoom = 0.01;
                    initialCanvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
                    opt.e.preventDefault();
                    opt.e.stopPropagation();
                })
            }

            // Cleanup on component unmount
            return () => {
                if (initialCanvas) {
                    initialCanvas.dispose();
                }
            };
        }

    }, [isCanvasReady, scale])

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
                    // 获取目标对象的坐标
                    const objectLeft = target.left!;
                    const objectTop = target.top!;

                    // 获取当前视口变换矩阵
                    const vpt = canvas.viewportTransform!;
                    startCircleRef.current = target;

                    // 将目标位置从 canvas 坐标系转换到容器坐标系
                    const objectPoint = new fabric.Point(objectLeft, objectTop);
                    const transformedPoint = fabric.util.transformPoint(objectPoint, vpt);

                    // 显示弹出层的代码，可以是模态框、提示框等
                    setPopoverPosition({ x: transformedPoint.x, y: transformedPoint.y });
                    setFromPosition({ x: objectPoint.x, y: objectPoint.y });
                    handleOpenPopover();
                }
            };

            // 监听对象的单击和双击事件
            canvas.on('mouse:down', handleObjectSelected);
            canvas.on('mouse:dblclick', handleObjectDblClick);
            canvas.on('mouse:up', () => {
                canvas.setViewportTransform(canvas?.viewportTransform!);
            });

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