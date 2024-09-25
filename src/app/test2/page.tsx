"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';

const Editor = () => {
    const [imageSrc, setImageSrc] = useState('/layer.png');
    const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null);
    const [scale, setScale] = useState(1); // 缩放比例
    const [isDragging, setIsDragging] = useState(false); // 拖拽状态
    const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null); // 拖拽起始点
    const containerRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null); // 引用 canvas

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
                canvasRef.current.width = img.width;
                canvasRef.current.height = img.height;
            }
        };

        return () => {
            img.onload = null;
        };
    }, [imageSrc]);

    const handleWheel = useCallback((event: WheelEvent) => {
        event.preventDefault();
        const delta = event.deltaY;
        setScale((prevScale) => Math.max(0.1, prevScale - delta / 1000));
    }, []);

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
        window.addEventListener('wheel', handleWheel);
        window.addEventListener('mousedown', handleMouseDown as EventListener);
        window.addEventListener('mousemove', handleMouseMove as EventListener);
        window.addEventListener('mouseup', handleMouseUp as EventListener);

        return () => {
            window.removeEventListener('wheel', handleWheel);
            window.removeEventListener('mousedown', handleMouseDown as EventListener);
            window.removeEventListener('mousemove', handleMouseMove as EventListener);
            window.removeEventListener('mouseup', handleMouseUp as EventListener);
        };
    }, [handleWheel, handleMouseMove, handleMouseUp]);

    // 在 canvas 上绘制圆形
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
                ctx.arc(x, y, 20, 0, 20 * Math.PI);
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
            <div
                ref={imageRef}
                style={{
                    position: 'absolute',
                    transform: `scale(${scale})`,
                    transformOrigin: 'top left',
                    width: imageSize ? `${imageSize.width}px` : 'auto',
                    height: imageSize ? `${imageSize.height}px` : 'auto',
                }}
            >
                <img
                    src={imageSrc}
                    alt="Background"
                    style={{
                        display: 'block',
                        width: '100%',
                        height: 'auto',
                    }}
                />
                {/* Canvas 用于绘制圆形 */}
                <canvas
                    ref={canvasRef}
                    onClick={handleCanvasClick}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: imageSize ? `${imageSize.width}px` : '100%',
                        height: imageSize ? `${imageSize.height}px` : '100%',
                        pointerEvents: 'auto', // 确保 canvas 接收点击事件
                    }}
                />
            </div>
        </div>
    );
};

export default Editor;
