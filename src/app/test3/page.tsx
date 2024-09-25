"use client";

import React, { useEffect, useRef } from 'react';
import { fabric } from 'fabric';

const CanvasWithBackground = () => {
    const canvasRef = useRef(null);
    const zoomFactor = 1.05; // 缩放因子

    useEffect(() => {
        if (!canvasRef.current) return;

        const canvas = new fabric.Canvas(canvasRef.current, {
            width: 8504,
            height: 1417,
        });

        // 加载并设置背景图片
        fabric.Image.fromURL('/layer.png', function (img) {
            img.scaleToWidth(canvas.width!);
            img.scaleToHeight(canvas.height!);

            canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
                scaleX: canvas.width! / img.width!,
                scaleY: canvas.height! / img.height!,
            });
        });

        // 添加鼠标滚轮事件监听器
        const handleMouseWheel = (opt: any) => {
            const event = opt.e; // 获取原生浏览器事件
            event.preventDefault(); // 防止页面滚动

            const delta = event.deltaY;
            let zoom = canvas.getZoom();
            const newZoom = zoom * (delta > 0 ? 1 / zoomFactor : zoomFactor);

            // 限制缩放范围
            if (newZoom >= 0.5 && newZoom <= 10) {
                canvas.zoomToPoint({ x: event.offsetX, y: event.offsetY }, newZoom);
            }

            // 获取缩放后的视口变换矩阵
            const vpt = canvas.viewportTransform;

            // 确保内容不移出屏幕边界
            if (vpt![4] > 0) {
                vpt![4] = 0;
            }
            if (vpt![5] > 0) {
                vpt![5] = 0;
            }

            const widthScaled = canvas.width! * canvas.getZoom();
            const heightScaled = canvas.height! * canvas.getZoom();

            // 如果右边缘超出屏幕
            if (widthScaled + vpt![4] < canvas.width!) {
                vpt![4] = canvas.width! - widthScaled;
            }

            // 如果底边缘超出屏幕
            if (heightScaled + vpt![5] < canvas.height!) {
                vpt![5] = canvas.height! - heightScaled;
            }

            canvas.requestRenderAll();
        };

        // 使用 fabric.js 的 'mouse:wheel' 事件
        canvas.on('mouse:wheel', handleMouseWheel);

        return () => {
            canvas.dispose();
        };
    }, []);

    return (
        <div>
            <canvas ref={canvasRef} id="canvas" />
        </div>
    );
};

export default CanvasWithBackground;
