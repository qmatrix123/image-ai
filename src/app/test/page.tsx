"use client";

import React, { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';

const CanvasComponent = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
    const [scale, setScale] = useState(1); // Canvas的缩放比例
    const [isCanvasReady, setIsCanvasReady] = useState(false);
    const isDragging = useRef(false);
    const lastPosX = useRef(0);
    const lastPosY = useRef(0);

    useEffect(() => {
        if (canvasRef.current) {
            const initCanvas = new fabric.Canvas(canvasRef.current, {
                selection: false,
            });

            setCanvas(initCanvas);

            // 标记Canvas已经准备好
            setIsCanvasReady(true);

            // 添加背景图片并平铺
            fabric.Image.fromURL('/layer.png', (img) => {
                const imgWidth = img.width!;
                const imgHeight = img.height!;
                const canvasWidth = initCanvas.width!;
                const canvasHeight = initCanvas.height!;

                const cols = Math.ceil(canvasWidth / imgWidth);
                const rows = Math.ceil(canvasHeight / imgHeight);

                // 创建一个临时的canvas来绘制图片
                const patternSourceCanvas = document.createElement('canvas');
                patternSourceCanvas.width = imgWidth * cols;
                patternSourceCanvas.height = imgHeight * rows;
                const patternSourceCtx = patternSourceCanvas.getContext('2d');

                // 在临时canvas上平铺图片
                if (patternSourceCtx) {
                    for (let row = 0; row < rows; row++) {
                        for (let col = 0; col < cols; col++) {
                            patternSourceCtx.drawImage(img.getElement(), col * imgWidth, row * imgHeight);
                        }
                    }
                }

                fabric.Image.fromURL(patternSourceCanvas.toDataURL(), (patternImage) => {
                    const pattern = new fabric.Pattern({
                        source: patternImage.getElement() as HTMLImageElement, // 使用fabric.Image对象的元素作为图案来源
                        repeat: 'no-repeat', // 只绘制一次
                    });

                    if (isCanvasReady && initCanvas) {
                        initCanvas.setBackgroundColor(pattern, () => { });
                        initCanvas.renderAll();
                    }
                });
            });

            // 添加图形
            if (initCanvas) {
                initCanvas.add(new fabric.Rect({
                    left: 100,
                    top: 100,
                    fill: 'red',
                    width: 100,
                    height: 100,
                    selectable: true,
                }));

                initCanvas.add(new fabric.Circle({
                    left: 300,
                    top: 150,
                    fill: 'blue',
                    radius: 50,
                    selectable: true,
                }));

                initCanvas.add(new fabric.Line([50, 50, 200, 200], {
                    stroke: 'green',
                    strokeWidth: 5,
                    selectable: true,
                }));

                // Mouse down event
                initCanvas.on('mouse:down', (opt) => {
                    const evt = opt.e;
                    isDragging.current = true;
                    lastPosX.current = evt.clientX;
                    lastPosY.current = evt.clientY;
                    initCanvas.selection = false;
                    initCanvas.forEachObject((obj) => {
                        obj.selectable = false;
                    });
                });

                // Mouse move event
                initCanvas.on('mouse:move', (opt) => {
                    if (isDragging.current) {
                        const evt = opt.e;
                        const vpt = initCanvas.viewportTransform!;
                        vpt[4] += (evt.clientX - lastPosX.current) / scale;
                        vpt[5] += (evt.clientY - lastPosY.current) / scale;
                        initCanvas.requestRenderAll();
                        lastPosX.current = evt.clientX;
                        lastPosY.current = evt.clientY;
                    }
                });

                // Mouse up event
                initCanvas.on('mouse:up', () => {
                    isDragging.current = false;
                    initCanvas.selection = true;
                    initCanvas.forEachObject((obj) => {
                        obj.selectable = true;
                    });
                });

                // Mouse wheel event for zooming
                initCanvas.on('mouse:wheel', function (opt) {
                    var delta = opt.e.deltaY;
                    var zoom = initCanvas.getZoom();
                    zoom *= 0.999 ** delta;
                    if (zoom > 20) zoom = 20;
                    if (zoom < 0.01) zoom = 0.01;
                    initCanvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
                    opt.e.preventDefault();
                    opt.e.stopPropagation();
                })
            }

            // Cleanup on component unmount
            return () => {
                if (initCanvas) {
                    initCanvas.dispose();
                }
            };
        }
    }, [isCanvasReady, scale]); // 依赖于isCanvasReady和scale，确保在缩放变化时重新渲染

    return (
        <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
            <canvas ref={canvasRef} width={window.innerWidth} height={window.innerHeight} />
        </div>
    );
};

export default CanvasComponent;
