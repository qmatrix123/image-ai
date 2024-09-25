"use client"

import { Logo } from "@/features/editor/components/logo"

import { fabric } from 'fabric'
import { useEditor } from "@/features/editor/hooks/use-editor"
import { useCallback, useEffect, useRef, useState } from "react"
import { Navbar } from './navbar'
import { Sidebar } from './sidebar'
import { Toolbar } from './toolbar'
import { Footer } from './footer'
import { ActiveTool, ActiveToolItem } from '../types'
import { ShapeSidebar } from './shape-sidebar'
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowRightIcon, SaveIcon } from 'lucide-react'
import { findPath } from "@/lib/utils"

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

export const Editor = () => {

    const [activeTool, setActiveTool] = useState<ActiveTool>("select");
    const [initialCanvas, setInitialCanvas] = useState<fabric.Canvas>()
    const [activeToolItem, setActiveToolItem] = useState<ActiveToolItem>("select");
    const [linePoint, setLinePoint] = useState<String>("")

    const onChangeActiveTool = useCallback((tool: ActiveTool) => {
        if (tool === "draw") {
            // editor?.enableDrawingMode();
        }

        if (activeTool === "draw") {
            // editor?.disableDrawingMode();
        }

        if (tool === activeTool) {
            return setActiveTool("select");
        }

        setActiveTool(tool);
    }, [activeTool]);

    const onChangeActiveToolItem = useCallback((toolItem: ActiveToolItem) => {

        console.log(toolItem, activeToolItem)


        if (toolItem === activeToolItem) {
            return setActiveToolItem("select");
        }

        setActiveToolItem(toolItem);
    }, [activeToolItem]);


    const [popoverVisible, setPopoverVisible] = useState(false);
    const [popoverPosition, setPopoverPosition] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
    const [fromPosition, setFromPosition] = useState<{ x: number, y: number }>({ x: 0, y: 0 });

    const handleOpenPopover = () => {

        setPopoverVisible(true)
        setPositionValue("")

        const activateObject = initialCanvas?.getActiveObject()

        console.log("activateObject?.name", activateObject?.name)

        const points = positionPointArray.filter((point) => { return point.name === activateObject?.name })

        const thePoint = points.length > 0 ? points[0].position : "";

        setPositionValue(thePoint + "")
    }

    const [positionLineArray, setPositionLineArray] = useState<PositionLine[]>([]);
    const [positionPointArray, setPositionPointArray] = useState<PositionPoint[]>([]);

    const saveToLocalStorage = () => {

        console.log('saveToLocalStorage | positionLineArray', positionLineArray)
        console.log('saveToLocalStorage | positionPointArray', positionPointArray)
        const data = {
            positionLines: positionLineArray,
            positionPoints: positionPointArray
        };

        console.log(
            {
                ...data
            }
        )

        const jsonData = JSON.stringify(data);

        localStorage.setItem('graphData', jsonData);
    };

    const canvasRef = useRef(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const mainRef = useRef<HTMLDivElement>(null)

    const { init, editor } = useEditor(
        activeToolItem,
        setPopoverVisible,
        setPopoverPosition,
        linePoint,
        fromPosition,
        setFromPosition,
        setLinePoint,
        handleOpenPopover,
        positionLineArray,
        positionPointArray,
        setPositionPointArray,
        setPositionLineArray,
        onChangeActiveTool,
        onChangeActiveToolItem,
        containerRef.current!
    )

    useEffect(() => {
        const canvas = new fabric.Canvas(
            canvasRef.current,
            {
                controlsAboveOverlay: true,
                preserveObjectStacking: true
            }
        )

        init({
            initialCanvas: canvas,
            initialContainer: containerRef.current!,
            mainContainer: mainRef.current!,
            activeToolItem: activeToolItem
        })

        setInitialCanvas(canvas)

        return () => {
            canvas.dispose()
        }
    }, [init])

    const [positionValue, setPositionValue] = useState("");


    const handlePositionSearch = (
        fromValue: string,
        toValue: string
    ) => {
        const pathNodes = findPath(fromValue, toValue, positionPointArray, positionLineArray)

        console.log("pathNodes", pathNodes)

        const objects: fabric.Object[] = initialCanvas?.getObjects()!;

        objects?.forEach(node => {
            node.set({ stroke: 'red' }); // 修改为红色
            node.set({ opacity: 1 }); // 修改为红色
        })

        for (let i = 0; i < pathNodes!.length - 1; i++) {
            const fromNode = pathNodes![i]
            const toNode = pathNodes![i + 1]

            console.log("fromNode", fromNode)
            console.log("toNode", toNode)

            console.log("positionLineArray")
            console.log(positionLineArray)

            const currentLines = positionLineArray.forEach(lineNode => {
                console.log(lineNode)

                if ((lineNode.fromName == fromNode && lineNode.toName === toNode) || (lineNode.fromName == toNode && lineNode.toName === fromNode)) {
                    // 处理当前line
                    const lineId = lineNode.lineId
                    objects?.forEach(node => {
                        if (node.name === lineId) {
                            console.log("&&&&&&")
                            console.log(node)
                            node.set({ stroke: 'yellow' }); // 修改为红色
                            node.set({ opacity: 1 }); // 设置透明度为30%
                        }
                    })
                    initialCanvas?.renderAll()
                }
            })
        }

        console.log(pathNodes)
    }

    return (
        <div className="h-full flex flex-col">
            <Navbar
                activeTool={activeTool}
                activeToolItem={activeToolItem}
                onChangeActiveTool={onChangeActiveTool}
                onChangeActiveToolItem={onChangeActiveToolItem}
                handlePositionSearch={handlePositionSearch}
                positionLineArray={positionLineArray}
                positionPointArray={positionPointArray}
                SetPositionPointArray={setPositionPointArray}
                setPositionLineArray={setPositionLineArray}
                initialCanvas={initialCanvas}
                saveToLocalStorage={saveToLocalStorage}
            />
            {/* <nav className="">
                <Logo />
                <Input
                    type="primary"
                    className="w-50"
                    value={fromValue}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                        setFromValue(event.target.value)
                    }}
                />
                <Input type="primary" className="w-50" value={toValue}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                        setToValue(event.target.value)
                    }}
                />
                <Button onClick={() => {



                }}>Search</Button>
            </nav> */}
            <div className="absolute h-[calc(100%-68px)] w-full top-[68px] flex">
                <Sidebar
                    activeTool={activeTool}
                    onChangeActiveTool={onChangeActiveTool}
                />
                <ShapeSidebar
                    editor={editor}
                    activeTool={activeTool}
                    activeToolItem={activeToolItem}
                    onChangeActiveTool={onChangeActiveTool}
                    onChangeActiveToolItem={onChangeActiveToolItem}
                />
                <main className="bg-muted flex-1 overflow-auto relative flex flex-col" ref={mainRef}>
                    {/* <Toolbar /> */}
                    <div className='flex-1 h-[calc(100%-124px)]' ref={containerRef}>
                        <canvas ref={canvasRef} />
                        {/* <canvas ref={canvasRef} width='7228px' height='1807px' /> */}
                        <Popover open={popoverVisible} onOpenChange={setPopoverVisible}>
                            <PopoverTrigger asChild>
                                <div style={{ position: 'absolute', left: popoverPosition.x, top: popoverPosition.y }} />
                            </PopoverTrigger>
                            <PopoverContent className='flex justify-center space-x-2 w-200'>
                                <Input
                                    type='primary'
                                    placeholder="Position"
                                    value={positionValue}
                                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                        setPositionValue(event.target.value)
                                    }}
                                />
                                <Button onClick={() => {
                                    console.log("Save Point", fromPosition.x, fromPosition.y)
                                    const activateObject = initialCanvas?.getActiveObject()

                                    // 获取最新点位
                                    const existPoints = positionPointArray.filter((point) => point.name === activateObject?.name)

                                    if (existPoints.length > 0) {
                                        existPoints[0].position = positionValue
                                    } else {
                                        const newPositionPoint = {
                                            position: positionValue || "",
                                            name: activateObject?.name,
                                            x: fromPosition.x,
                                            y: fromPosition.y,
                                            type: activateObject?.type
                                        }

                                        positionPointArray.push(newPositionPoint)
                                    }

                                    // 过滤文本标签
                                    const textObjects = initialCanvas?.getObjects().filter(object => object.name === (activateObject?.name + '-text'))

                                    if (textObjects && textObjects.length > 0) {
                                        const textObject = textObjects[0]
                                        initialCanvas?.remove(textObject)
                                    }
                                    // 新增文本标签
                                    const text = new fabric.Text(positionValue, {
                                        left: fromPosition.x - 60,
                                        top: fromPosition.y - 40,
                                        fontFamily: 'Arial',
                                        fontSize: 22,
                                        fill: 'red',
                                        name: activateObject?.name + "-text"
                                    });

                                    initialCanvas?.add(text);

                                    console.log({
                                        ...positionPointArray
                                    })

                                    setPopoverVisible(false)
                                    setPositionValue("")
                                }}>
                                    <SaveIcon className='mr-1' />
                                    Save
                                </Button>
                                <Button onClick={() => {
                                    setLinePoint("linePoint")
                                    setActiveToolItem("circle")

                                    // TODO: 单独画一条动态的参考线出来，随着鼠标移动而移动
                                    setPopoverVisible(false)
                                }}>
                                    <ArrowRightIcon className='mr-1' />
                                    Next
                                </Button>
                            </PopoverContent>
                        </Popover>
                    </div>
                    {/* <Footer /> */}
                </main>
            </div >
        </div >

    )
}