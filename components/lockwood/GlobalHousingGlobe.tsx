import React, { useEffect, useMemo, useRef, useState } from 'react';
import { HousingMarket } from '../../lib/propertyIntelligenceStore';
import {
  cityCoordinates,
  DataType,
  formatDubaiComparison,
  formatHousingValue,
  getDisplayValue,
  HousingData,
  IndexType,
  loadHousingData,
  PriceUnit,
  TimePeriod,
} from '../../lib/housingData';

interface GlobalHousingGlobeProps {
  fallbackMarkets: HousingMarket[];
  dataType: DataType;
  priceUnit: PriceUnit;
  indexType: IndexType;
  timePeriod: TimePeriod;
}

interface RenderMarket {
  data: HousingData;
  lat: number;
  lon: number;
  value: number | null;
  comparison: number | null;
  label: string;
}

interface LabelBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface LandFeature {
  geometry?: {
    type?: 'Polygon' | 'MultiPolygon';
    coordinates?: unknown;
  };
}

const LAND_GEOJSON_URL =
  'https://raw.githubusercontent.com/martynafford/natural-earth-geojson/master/110m/physical/ne_110m_land.json';

const FALLBACK_LAND_POLYGONS: Array<Array<[number, number]>> = [
  [[-168, 72], [-135, 72], [-112, 58], [-95, 50], [-82, 28], [-97, 16], [-122, 24], [-142, 48], [-168, 58], [-168, 72]],
  [[-82, 12], [-64, 10], [-48, -10], [-55, -35], [-70, -56], [-78, -32], [-82, 12]],
  [[-18, 36], [8, 58], [44, 58], [78, 50], [122, 56], [152, 44], [142, 20], [96, 8], [70, 22], [34, 30], [-6, 34], [-18, 36]],
  [[-18, 34], [28, 34], [50, 8], [38, -34], [14, -36], [-8, -10], [-18, 34]],
  [[112, -10], [154, -18], [152, -42], [114, -38], [112, -10]],
  [[-52, 82], [-18, 74], [-34, 60], [-58, 62], [-52, 82]],
];

const toRad = (value: number) => (value * Math.PI) / 180;
const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const boxesOverlap = (a: LabelBox, b: LabelBox) =>
  a.x < b.x + b.width + 8 &&
  a.x + a.width + 8 > b.x &&
  a.y < b.y + b.height + 8 &&
  a.y + a.height + 8 > b.y;

const fallbackToHousingData = (markets: HousingMarket[]): HousingData[] =>
  markets
    .map(market => {
      const coords = cityCoordinates[market.city];
      if (!coords) return null;
      return {
        city: market.city,
        country: market.country,
        usdPerSqm: market.usdPerSqft ? market.usdPerSqft * 10.7639 : null,
        usdPerSqft: market.usdPerSqft,
        vsDubaiPrice: market.vsDubai,
        hpiNominal1Y: market.hpi1Y,
        hpiNominal1YVsDubaiPp: null,
        hpiInflAdj1Y: market.hpi1Y,
        hpiInflAdj1YVsDubaiPp: null,
        hpiNominal5Y: market.hpi5Y,
        hpiNominal5YVsDubaiPp: null,
        hpiInflAdj5Y: market.hpi5Y,
        hpiInflAdj5YVsDubaiPp: null,
        hpiNominal10Y: null,
        hpiNominal10YVsDubaiPp: null,
        hpiInflAdj10Y: null,
        hpiInflAdj10YVsDubaiPp: null,
        latitude: coords[0],
        longitude: coords[1],
      } satisfies HousingData;
    })
    .filter((market): market is HousingData => Boolean(market));

const GlobalHousingGlobe: React.FC<GlobalHousingGlobeProps> = ({
  fallbackMarkets,
  dataType,
  priceUnit,
  indexType,
  timePeriod,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const dataRef = useRef<RenderMarket[]>([]);
  const landRef = useRef<LandFeature[]>([]);
  const [housingData, setHousingData] = useState<HousingData[]>([]);
  const [landFeatures, setLandFeatures] = useState<LandFeature[]>([]);
  const [loadFailed, setLoadFailed] = useState(false);

  const fallbackData = useMemo(() => fallbackToHousingData(fallbackMarkets), [fallbackMarkets]);

  const renderMarkets = useMemo<RenderMarket[]>(() => {
    const source = housingData.length ? housingData : fallbackData;
    return source
      .map(data => {
        if (data.latitude === undefined || data.longitude === undefined) return null;
        const display = getDisplayValue(data, dataType, priceUnit, indexType, timePeriod);
        return {
          data,
          lat: data.latitude,
          lon: data.longitude,
          value: display.value,
          comparison: display.comparison,
          label: display.label,
        };
      })
      .filter((market): market is RenderMarket => Boolean(market));
  }, [dataType, fallbackData, housingData, indexType, priceUnit, timePeriod]);

  useEffect(() => {
    dataRef.current = renderMarkets;
  }, [renderMarkets]);

  useEffect(() => {
    landRef.current = landFeatures;
  }, [landFeatures]);

  useEffect(() => {
    let active = true;
    loadHousingData()
      .then(rows => {
        if (!active) return;
        setHousingData(rows);
        setLoadFailed(false);
      })
      .catch(() => {
        if (!active) return;
        setLoadFailed(true);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 3500);

    fetch(LAND_GEOJSON_URL, { signal: controller.signal })
      .then(response => (response.ok ? response.json() : Promise.reject(new Error('Land data unavailable'))))
      .then(data => {
        if (!active) return;
        const features = Array.isArray(data?.features) ? data.features : [];
        setLandFeatures(features);
      })
      .catch(() => {
        if (active) setLandFeatures([]);
      })
      .finally(() => window.clearTimeout(timeout));

    return () => {
      active = false;
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const state = {
      rotation: -30,
      tilt: -10,
      scale: 1,
      dragging: false,
      lastX: 0,
      lastY: 0,
      hoverCity: '',
      pausedUntil: 0,
      pinchDistance: 0,
      pinchScale: 1,
    };

    const resize = () => {
      const parent = canvas.parentElement;
      const width = Math.max(300, parent?.clientWidth || 620);
      const height = Math.max(320, Math.min(520, width * 0.67));
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const project = (lat: number, lon: number, width: number, height: number, radius: number) => {
      const rotation = toRad(state.rotation);
      const tilt = toRad(state.tilt);
      const lambda = toRad(lon) + rotation;
      const phi = toRad(lat);
      const cosPhi = Math.cos(phi);
      const x3 = cosPhi * Math.sin(lambda);
      const y3 = Math.sin(phi);
      const z3 = cosPhi * Math.cos(lambda);
      const yTilted = y3 * Math.cos(tilt) - z3 * Math.sin(tilt);
      const zTilted = y3 * Math.sin(tilt) + z3 * Math.cos(tilt);

      return {
        x: width / 2 + radius * x3,
        y: height / 2 - radius * yTilted,
        visible: zTilted > -0.02,
        depth: zTilted,
      };
    };

    const drawLine = (points: Array<[number, number]>, width: number, height: number, radius: number) => {
      let drawing = false;
      points.forEach(([lat, lon]) => {
        const point = project(lat, lon, width, height, radius);
        if (!point.visible) {
          drawing = false;
          return;
        }
        if (!drawing) {
          ctx.moveTo(point.x, point.y);
          drawing = true;
        } else {
          ctx.lineTo(point.x, point.y);
        }
      });
    };

    const drawGeoRing = (ring: unknown, width: number, height: number, radius: number) => {
      if (!Array.isArray(ring)) return;
      let drawing = false;
      ring.forEach(coord => {
        if (!Array.isArray(coord) || coord.length < 2) {
          drawing = false;
          return;
        }
        const lon = Number(coord[0]);
        const lat = Number(coord[1]);
        if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
          drawing = false;
          return;
        }
        const point = project(lat, lon, width, height, radius);
        if (!point.visible) {
          drawing = false;
          return;
        }
        if (!drawing) {
          ctx.moveTo(point.x, point.y);
          drawing = true;
        } else {
          ctx.lineTo(point.x, point.y);
        }
      });
    };

    const drawLand = (width: number, height: number, radius: number) => {
      const features = landRef.current;
      if (!features.length) {
        ctx.beginPath();
        FALLBACK_LAND_POLYGONS.forEach(ring => drawGeoRing(ring, width, height, radius));
        ctx.fillStyle = 'rgba(180, 154, 104, 0.2)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(245, 240, 230, 0.32)';
        ctx.lineWidth = 0.8;
        ctx.stroke();
        return;
      }

      ctx.beginPath();
      features.forEach(feature => {
        const geometry = feature.geometry;
        if (!geometry?.coordinates) return;

        if (geometry.type === 'Polygon' && Array.isArray(geometry.coordinates)) {
          geometry.coordinates.forEach(ring => drawGeoRing(ring, width, height, radius));
        }

        if (geometry.type === 'MultiPolygon' && Array.isArray(geometry.coordinates)) {
          geometry.coordinates.forEach(polygon => {
            if (!Array.isArray(polygon)) return;
            polygon.forEach(ring => drawGeoRing(ring, width, height, radius));
          });
        }
      });

      ctx.fillStyle = 'rgba(180, 154, 104, 0.2)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(245, 240, 230, 0.34)';
      ctx.lineWidth = 0.8;
      ctx.stroke();
    };

    const roundedRect = (x: number, y: number, width: number, height: number, radius: number) => {
      const r = Math.min(radius, width / 2, height / 2);
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + width, y, x + width, y + height, r);
      ctx.arcTo(x + width, y + height, x, y + height, r);
      ctx.arcTo(x, y + height, x, y, r);
      ctx.arcTo(x, y, x + width, y, r);
      ctx.closePath();
    };

    const getCanvasPoint = (event: PointerEvent | WheelEvent | Touch) => {
      const rect = canvas.getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    };

    const render = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const baseRadius = Math.min(width, height) * 0.35;
      const radius = baseRadius * state.scale;
      const centerX = width / 2;
      const centerY = height / 2;

      ctx.clearRect(0, 0, width, height);

      const shell = ctx.createRadialGradient(
        centerX - radius * 0.34,
        centerY - radius * 0.36,
        0,
        centerX,
        centerY,
        radius * 1.16,
      );
      shell.addColorStop(0, 'rgba(245, 240, 230, 0.24)');
      shell.addColorStop(0.36, 'rgba(180, 154, 104, 0.16)');
      shell.addColorStop(0.74, 'rgba(18, 34, 56, 0.38)');
      shell.addColorStop(1, 'rgba(0, 0, 0, 0.78)');

      ctx.save();
      ctx.shadowColor = 'rgba(180, 154, 104, 0.38)';
      ctx.shadowBlur = 36;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fillStyle = shell;
      ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.clip();

      ctx.beginPath();
      for (let lon = -180; lon <= 180; lon += 20) {
        const points: Array<[number, number]> = [];
        for (let lat = -80; lat <= 80; lat += 4) points.push([lat, lon]);
        drawLine(points, width, height, radius);
      }
      for (let lat = -60; lat <= 60; lat += 20) {
        const points: Array<[number, number]> = [];
        for (let lon = -180; lon <= 180; lon += 4) points.push([lat, lon]);
        drawLine(points, width, height, radius);
      }
      ctx.strokeStyle = 'rgba(245, 240, 230, 0.16)';
      ctx.lineWidth = 0.7;
      ctx.stroke();

      drawLand(width, height, radius);
      ctx.restore();

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(245, 240, 230, 0.42)';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      const visibleMarkets = dataRef.current
        .map(market => {
          const point = project(market.lat, market.lon, width, height, radius);
          return { ...market, point };
        })
        .filter(item => item.point.visible)
        .sort((a, b) => a.point.depth - b.point.depth);

      visibleMarkets.forEach(({ data, point }) => {
        const isDubai = data.city === 'Dubai';
        const isHovered = state.hoverCity === data.city;
        const dotRadius = isDubai ? 5.2 : isHovered ? 4.7 : 3.3;

        ctx.save();
        ctx.shadowColor = isDubai ? 'rgba(180, 154, 104, 0.85)' : 'rgba(245, 240, 230, 0.35)';
        ctx.shadowBlur = isDubai || isHovered ? 16 : 8;
        ctx.beginPath();
        ctx.arc(point.x, point.y, dotRadius, 0, Math.PI * 2);
        ctx.fillStyle = isDubai ? '#B49A68' : '#F5F0E6';
        ctx.fill();
        ctx.strokeStyle = '#122238';
        ctx.lineWidth = 1.4;
        ctx.stroke();
        ctx.restore();
      });

      const labelCandidates = visibleMarkets
        .filter(item => item.data.city === 'Dubai' || item.data.city === state.hoverCity || item.value !== null)
        .sort((a, b) => {
          if (a.data.city === 'Dubai') return -1;
          if (b.data.city === 'Dubai') return 1;
          if (a.data.city === state.hoverCity) return -1;
          if (b.data.city === state.hoverCity) return 1;
          if (a.value === null && b.value !== null) return 1;
          if (a.value !== null && b.value === null) return -1;
          return Math.abs(b.comparison || 0) - Math.abs(a.comparison || 0);
        })
        .slice(0, state.hoverCity ? 11 : 10);

      const placed: LabelBox[] = [];
      labelCandidates.forEach(({ data, point, value, comparison, label }) => {
        const cityText = data.city.toUpperCase();
        const valueText = formatHousingValue(value, dataType, label);
        const comparisonText = formatDubaiComparison(comparison, dataType);

        ctx.font = '700 11px Inter, Arial, sans-serif';
        const cityWidth = ctx.measureText(cityText).width;
        ctx.font = '600 10px Inter, Arial, sans-serif';
        const valueWidth = ctx.measureText(valueText).width;
        const comparisonWidth = ctx.measureText(comparisonText).width;
        const boxWidth = Math.min(192, Math.max(cityWidth, valueWidth, comparisonWidth) + 22);
        const boxHeight = 56;
        const preferredX = point.x > width * 0.62 ? point.x - boxWidth - 14 : point.x + 14;
        let x = clamp(preferredX, 8, width - boxWidth - 8);
        let y = clamp(point.y - 34, 8, height - boxHeight - 8);
        let box = { x, y, width: boxWidth, height: boxHeight };

        const offsets = [0, -26, 26, -52, 52, -78, 78];
        for (const offset of offsets) {
          y = clamp(point.y - 34 + offset, 8, height - boxHeight - 8);
          x = clamp(preferredX, 8, width - boxWidth - 8);
          box = { x, y, width: boxWidth, height: boxHeight };
          if (!placed.some(existing => boxesOverlap(existing, box))) break;
        }
        if (placed.some(existing => boxesOverlap(existing, box))) return;
        placed.push(box);

        roundedRect(box.x, box.y, box.width, box.height, 5);
        ctx.fillStyle = data.city === 'Dubai' ? 'rgba(180, 154, 104, 0.96)' : 'rgba(18, 34, 56, 0.94)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(245, 240, 230, 0.28)';
        ctx.stroke();

        ctx.fillStyle = data.city === 'Dubai' ? '#122238' : '#F5F0E6';
        ctx.font = '700 11px Inter, Arial, sans-serif';
        ctx.fillText(cityText, box.x + 11, box.y + 15, box.width - 22);
        ctx.font = '600 10px Inter, Arial, sans-serif';
        ctx.fillText(valueText, box.x + 11, box.y + 33, box.width - 22);
        ctx.fillStyle = data.city === 'Dubai' ? 'rgba(18, 34, 56, 0.72)' : 'rgba(245, 240, 230, 0.68)';
        ctx.fillText(comparisonText, box.x + 11, box.y + 48, box.width - 22);
      });
    };

    const tick = () => {
      if (!mediaQuery.matches && !state.dragging && Date.now() > state.pausedUntil) {
        state.rotation += 0.06;
      }
      render();
      frameRef.current = window.requestAnimationFrame(tick);
    };

    const updateHover = (event: PointerEvent) => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const radius = Math.min(width, height) * 0.35 * state.scale;
      const mouse = getCanvasPoint(event);
      let nearest = '';
      let nearestDistance = 16;

      dataRef.current.forEach(market => {
        const point = project(market.lat, market.lon, width, height, radius);
        if (!point.visible) return;
        const distance = Math.hypot(point.x - mouse.x, point.y - mouse.y);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearest = market.data.city;
        }
      });

      state.hoverCity = nearest;
      canvas.style.cursor = nearest ? 'pointer' : 'grab';
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      state.dragging = true;
      state.lastX = event.clientX;
      state.lastY = event.clientY;
      state.pausedUntil = Date.now() + 1600;
      canvas.style.cursor = 'grabbing';
      canvas.setPointerCapture(event.pointerId);
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      if (state.dragging) {
        const dx = event.clientX - state.lastX;
        const dy = event.clientY - state.lastY;
        state.rotation += dx * 0.45;
        state.tilt = clamp(state.tilt + dy * 0.25, -55, 55);
        state.lastX = event.clientX;
        state.lastY = event.clientY;
        state.pausedUntil = Date.now() + 1800;
        return;
      }
      updateHover(event);
    };

    const stopPointerDrag = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      state.dragging = false;
      state.pausedUntil = Date.now() + 1600;
      canvas.style.cursor = 'grab';
      if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
    };

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      const zoomFactor = event.deltaY > 0 ? 0.92 : 1.08;
      state.scale = clamp(state.scale * zoomFactor, 0.68, 2.35);
      state.pausedUntil = Date.now() + 1800;
    };

    const touchDistance = (touches: TouchList) => {
      const first = touches[0];
      const second = touches[1];
      return Math.hypot(first.clientX - second.clientX, first.clientY - second.clientY);
    };

    const handleTouchStart = (event: TouchEvent) => {
      if (event.touches.length === 1) {
        state.dragging = true;
        state.lastX = event.touches[0].clientX;
        state.lastY = event.touches[0].clientY;
      } else if (event.touches.length === 2) {
        state.dragging = false;
        state.pinchDistance = touchDistance(event.touches);
        state.pinchScale = state.scale;
      }
      state.pausedUntil = Date.now() + 1800;
    };

    const handleTouchMove = (event: TouchEvent) => {
      event.preventDefault();
      if (event.touches.length === 2 && state.pinchDistance > 0) {
        const nextDistance = touchDistance(event.touches);
        state.scale = clamp(state.pinchScale * (nextDistance / state.pinchDistance), 0.68, 2.35);
        state.pausedUntil = Date.now() + 1800;
        return;
      }

      if (event.touches.length === 1 && state.dragging) {
        const dx = event.touches[0].clientX - state.lastX;
        const dy = event.touches[0].clientY - state.lastY;
        state.rotation += dx * 0.45;
        state.tilt = clamp(state.tilt + dy * 0.25, -55, 55);
        state.lastX = event.touches[0].clientX;
        state.lastY = event.touches[0].clientY;
        state.pausedUntil = Date.now() + 1800;
      }
    };

    const handleTouchEnd = () => {
      state.dragging = false;
      state.pinchDistance = 0;
      state.pausedUntil = Date.now() + 1600;
    };

    const handleLeave = () => {
      state.hoverCity = '';
      state.dragging = false;
      canvas.style.cursor = 'grab';
    };

    resize();
    canvas.style.cursor = 'grab';
    frameRef.current = window.requestAnimationFrame(tick);

    window.addEventListener('resize', resize);
    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerup', stopPointerDrag);
    canvas.addEventListener('pointercancel', stopPointerDrag);
    canvas.addEventListener('pointerleave', handleLeave);
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd);
    canvas.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerup', stopPointerDrag);
      canvas.removeEventListener('pointercancel', stopPointerDrag);
      canvas.removeEventListener('pointerleave', handleLeave);
      canvas.removeEventListener('wheel', handleWheel);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
      canvas.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [dataType]);

  return (
    <div className="relative overflow-hidden border border-[#B49A68]/25 bg-[#08111D]">
      <canvas
        ref={canvasRef}
        aria-label="Interactive rotating globe comparing global housing markets"
        className="block w-full touch-none"
      />
      <div className="pointer-events-none absolute bottom-3 left-3 border border-[#B49A68]/25 bg-[#122238]/85 px-3 py-2 text-[11px] font-medium text-[#F5F0E6]/75">
        Drag to rotate / scroll or pinch to zoom
      </div>
      <div className="pointer-events-none absolute right-3 top-3 border border-[#B49A68]/25 bg-[#122238]/85 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#F5F0E6]/75">
        {renderMarkets.length} cities
      </div>
      {loadFailed && (
        <div className="absolute right-3 top-12 border border-[#B49A68]/25 bg-[#122238]/90 px-3 py-2 text-[11px] font-medium text-[#F5F0E6]/75">
          Using saved market snapshot
        </div>
      )}
    </div>
  );
};

export default GlobalHousingGlobe;
