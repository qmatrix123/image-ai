"use client"

import { Logo } from "@/features/editor/components/logo"
import { fabric } from 'fabric'
import {
    DropdownMenu,
    DropdownMenuItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { ChevronDown, Circle, CircleAlertIcon, Download, HardDriveIcon, Layers2Icon, MousePointerClick, Redo2, Undo2 } from "lucide-react"
import { CiFileOn } from "react-icons/ci"
import { Separator } from "@/components/ui/separator";
import { Hint } from "@/components/ui/hint"
import { BsCloudCheck } from "react-icons/bs"
import { ActiveTool, ActiveToolItem } from "../types"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { FaPlugCircleBolt } from "react-icons/fa6"

interface PositionPoint {
    position: String | undefined;
    name: String | undefined;
    x: number;
    y: number;
    type: String | undefined
}

interface PositionLine {
    // 起点uuid
    fromName: string;
    // 终点uuid
    toName: string;

    lineId: string;
}

interface NavbarProps {
    activeTool: ActiveTool;
    activeToolItem: ActiveToolItem;
    onChangeActiveTool: (tool: ActiveTool) => void;
    handlePositionSearch: any;
    onChangeActiveToolItem: any;
    positionLineArray: any;
    positionPointArray: any;
    setPositionLineArray: any;
    SetPositionPointArray: any;
    initialCanvas: any;
    saveToLocalStorage: any;
};



export const Navbar = ({
    activeTool,
    activeToolItem,
    onChangeActiveTool,
    handlePositionSearch,
    onChangeActiveToolItem,
    positionLineArray,
    positionPointArray,
    setPositionLineArray,
    SetPositionPointArray,
    initialCanvas,
    saveToLocalStorage
}: NavbarProps) => {

    const [fromValue, setFromValue] = useState("")
    const [toValue, setToValue] = useState("")

    const saveToFile = (filename: string, data: any) => {
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
    };


    const loadFromFile = (event: React.ChangeEvent<HTMLInputElement>) => {

        console.log(loadFromFile)
        const file = event.target.files?.[0];
        console.log(file)
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result as string;
                const data = JSON.parse(result);
                setPositionLineArray(data.positionLines);
                SetPositionPointArray(data.positionPoints);

                console.log(data.positionLines)
                console.log(data.positionPoints)

                // renderFromData(initialCanvas, data.positionPoints, data.positionLines)
            };
            reader.readAsText(file);
        }
    };

    const loadFromLocalStorage = () => {
        // 从 localStorage 获取数据
        const jsonData = localStorage.getItem('graphData');

        if (jsonData) {
            // 将 JSON 字符串转换为对象
            const data = JSON.parse(jsonData);

            // 更新状态
            setPositionLineArray(data.positionLines);
            SetPositionPointArray(data.positionPoints);

            console.log('loadFromLocalStorage', data.positionLines, data.positionPoints)

            // 渲染图形
            renderFromData(initialCanvas, data.positionPoints, data.positionLines);
        } else {
            console.log('No data found in localStorage');
        }
    };

    const renderFromData = (canvas: fabric.Canvas, positionPoints: PositionPoint[], positionLines: PositionLine[]) => {
        // 清除点和线（保留背景图）
        const objects = canvas.getObjects();
        objects.forEach(obj => {
            // 只删除点和线，不删除背景图
            if (obj.type === 'circle' || obj.type === 'line') {
                canvas.remove(obj);
            }
        });

        // 渲染点
        positionPoints.forEach(point => {
            const circle = new fabric.Circle({
                name: point.name + "",
                left: point.x,
                top: point.y,
                radius: 20,
                fill: 'blue',

            });
            canvas.add(circle);

            const text = new fabric.Text(point.position + "", {
                left: point.x - 60,
                top: point.y - 40,
                fontFamily: 'Arial',
                fontSize: 22,
                fill: 'red',
                name: point?.name + "-text"
            });

            canvas.add(text);
        });

        // 渲染线
        positionLines.forEach(line => {
            const fromPoint = positionPoints.find(point => point.name === line.fromName);
            const toPoint = positionPoints.find(point => point.name === line.toName);

            if (fromPoint && toPoint) {
                const fabricLine = new fabric.Line([fromPoint.x + 20, fromPoint.y + 20, toPoint.x + 20, toPoint.y + 20], {
                    name: line.lineId,
                    stroke: 'red',
                    strokeWidth: 5,
                });
                canvas.add(fabricLine);
            }
        });

        // 渲染完成后刷新画布
        canvas.requestRenderAll();
    };

    return (
        <nav className="w-full flex items-center p-4 h-[68px] gap-x-8 border-b lg:pl-[34px]">
            <Logo />
            <div className="w-full flex items-center gap-x-1 h-full">
                <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="ghost">
                            File
                            <ChevronDown className="size-4 ml-2" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="min-w-60">
                        <DropdownMenuItem
                            onClick={() => {
                                loadFromLocalStorage()
                            }}
                            className="flex items-center gap-x-2"
                        >
                            <CiFileOn className="size-8" />
                            <div>
                                <p>Open</p>
                                <p className="text-xs text-muted-foreground">
                                    Open a JSON file
                                </p>
                            </div>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                <Separator orientation="vertical" className="mx-2" />
                <Hint label="Select" side="bottom" sideOffset={10}>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                            onChangeActiveTool("select")
                            onChangeActiveToolItem("select")
                        }}
                        className={cn(activeTool === "select" && activeToolItem === "select" && "bg-gray-100")}
                    >
                        <MousePointerClick className="size-4" />
                    </Button>
                </Hint>
                <Hint label="Circle" side="bottom" sideOffset={10}>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                            onChangeActiveTool("select")
                            onChangeActiveToolItem("circle")
                        }}
                        className={cn(activeTool === "select" && activeToolItem === "circle" && "bg-gray-100")}
                    >
                        <Circle className="size-4 bg-blue-600 rounded-full" />
                    </Button>
                </Hint>
                <Hint label="Undo" side="bottom" sideOffset={10}>
                    <Button
                        disabled={false}
                        variant="ghost"
                        size="icon"
                        onClick={() => { }}
                    >
                        <Undo2 className="size-4" />
                    </Button>
                </Hint>
                <Hint label="Redo" side="bottom" sideOffset={10}>
                    <Button
                        disabled={false}
                        variant="ghost"
                        size="icon"
                        onClick={() => { }}
                    >
                        <Redo2 className="size-4" />
                    </Button>
                </Hint>
                <Separator orientation="vertical" className="mx-2" />
                <div className="flex items-center gap-x-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                            const objects: fabric.Object[] = initialCanvas.getObjects()
                            objects.forEach(object => {
                                object.set({ opacity: 0 }); // 设置透明度为30%
                            })
                            initialCanvas.renderAll(); // 刷新画布以显示更改
                        }}
                        className={cn(activeTool === "select" && activeToolItem === "circle" && "bg-gray-100")}
                    >
                        <Layers2Icon className="size-4 rounded-full" />
                    </Button>
                </div>
                <Separator orientation="vertical" className="mx-2" />
                <div className="flex items-center gap-x-2">
                    <div className="text-xs text-muted-foreground">
                        <Input
                            type="primary"
                            className="w-50"
                            value={fromValue}
                            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                setFromValue(event.target.value)
                            }}
                        />
                    </div>
                    <div className="text-xs text-muted-foreground">
                        <Input type="primary" className="w-50" value={toValue}
                            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                setToValue(event.target.value)
                            }}
                        />
                    </div>
                    <Button onClick={() => handlePositionSearch(fromValue, toValue)}>Search</Button>
                </div>
                <div className="ml-auto flex items-center gap-x-4">
                    <DropdownMenu modal={false}>
                        <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="ghost">
                                Export
                                <Download className="size-4 ml-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="min-w-60">
                            <DropdownMenuItem
                                className="flex items-center gap-x-2"
                                onClick={() => {
                                    saveToLocalStorage()
                                    saveToFile('positionData.json', {
                                        positionLines: positionLineArray,
                                        positionPoints: positionPointArray,
                                    });
                                }}
                            >
                                <CiFileOn className="size-8" />
                                <div>
                                    <p>JSON</p>
                                    <p className="text-xs text-muted-foreground">
                                        Save for later editing
                                    </p>
                                </div>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="flex items-center gap-x-2"
                                onClick={() => { }}
                            >
                                <CiFileOn className="size-8" />
                                <div>
                                    <p>PNG</p>
                                    <p className="text-xs text-muted-foreground">
                                        Best for sharing on the web
                                    </p>
                                </div>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="flex items-center gap-x-2"
                                onClick={() => { }}
                            >
                                <CiFileOn className="size-8" />
                                <div>
                                    <p>JPG</p>
                                    <p className="text-xs text-muted-foreground">
                                        Best for printing
                                    </p>
                                </div>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="flex items-center gap-x-2"
                                onClick={() => { }}
                            >
                                <CiFileOn className="size-8" />
                                <div>
                                    <p>SVG</p>
                                    <p className="text-xs text-muted-foreground">
                                        Best for editing in vector software
                                    </p>
                                </div>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </nav>
    )
}