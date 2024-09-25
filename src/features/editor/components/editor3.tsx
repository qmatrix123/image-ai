"use client"

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { fabric } from 'fabric';

export const Editor = () => {
    const [imageSrc, setImageSrc] = useState('/layer.png');
    const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null);
    const [scale, setScale] = useState(1); // 缩放比例
    const [isDragging, setIsDragging] = useState(false); // 拖拽状态
    const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null); // 拖拽起始点

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const img = new Image();
        img.src = imageSrc;

        img.onload = () => {
            setImageSize({
                width: img.width,
                height: img.height,
            });

            // 设置 canvas 的宽高
            if (canvasRef.current) {
                const canvas = new fabric.Canvas(canvasRef.current, {
                    controlsAboveOverlay: true,
                    preserveObjectStacking: true,
                });

                canvas.setBackgroundImage(img.src, canvas.renderAll.bind(canvas), {
                    scaleX: canvas.width! / img.width!,
                    scaleY: canvas.height! / img.height!
                });

                // Handle image scaling and dragging
                canvas.on('mouse:wheel', (opt) => {
                    const delta = opt.e.deltaY;
                    setScale((prevScale) => Math.max(0.1, prevScale - delta / 1000));
                });

                setImageSize({
                    width: canvas.width!,
                    height: canvas.height!
                });
            }
        };

        return () => {
            img.onload = null;
        };
    }, [imageSrc]);

    const handleMouseDown = (event: MouseEvent) => {
        event.preventDefault();
        setIsDragging(true);
        setDragStart({ x: event.clientX, y: event.clientY });
    };

    const handleMouseMove = (event: MouseEvent) => {
        if (!isDragging || !dragStart || !containerRef.current) return;

        const container = containerRef.current;
        const dx = event.clientX - dragStart.x;
        const dy = event.clientY - dragStart.y;

        container.scrollLeft -= dx;
        container.scrollTop -= dy;

        setDragStart({ x: event.clientX, y: event.clientY });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    useEffect(() => {
        window.addEventListener('mousedown', handleMouseDown as EventListener);
        window.addEventListener('mousemove', handleMouseMove as EventListener);
        window.addEventListener('mouseup', handleMouseUp as EventListener);

        return () => {
            window.removeEventListener('mousedown', handleMouseDown as EventListener);
            window.removeEventListener('mousemove', handleMouseMove as EventListener);
            window.removeEventListener('mouseup', handleMouseUp as EventListener);
        };
    }, [handleMouseMove, handleMouseUp]);

    const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
        const canvas = canvasRef.current;
        if (canvas && imageSize) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                const rect = canvas.getBoundingClientRect();
                const x = (event.clientX - rect.left) / scale; // 计算缩放后的实际坐标
                const y = (event.clientY - rect.top) / scale;

                // 绘制圆形
                ctx.beginPath();
                ctx.arc(x, y, 20, 0, 2 * Math.PI);
                ctx.fillStyle = 'blue';
                ctx.fill();
            }
        }
    };

    return (
        <div
            className="scroll-container"
            ref={containerRef}
            style={{
                position: 'relative',
                width: '100vw',
                height: '100vh',
                overflow: 'auto',
                border: '2px solid red',
                backgroundColor: '#f0f0f0',
                cursor: isDragging ? 'grabbing' : 'grab',
            }}
        >
            <canvas
                ref={canvasRef}
                onClick={handleCanvasClick}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    transform: `scale(${scale})`,
                    transformOrigin: 'top left',
                    width: imageSize ? `${imageSize.width}px` : '100%',
                    height: imageSize ? `${imageSize.height}px` : '100%',
                    pointerEvents: 'auto', // 确保 canvas 接收点击事件
                }}
            />
        </div>
    );
};

