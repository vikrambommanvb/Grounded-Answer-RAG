import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { BookOpen, Layers } from 'lucide-react';
import { ClauseDetail } from '../../types';

interface StatutoryGraph3DProps {
  clauses: ClauseDetail[];
  selectedClauseId: string | null;
  onSelectClause: (clauseId: string) => void;
}

export const StatutoryGraph3D: React.FC<StatutoryGraph3DProps> = ({
  clauses,
  selectedClauseId,
  onSelectClause,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');
  const [hoveredClauseId, setHoveredClauseId] = useState<string | null>(null);

  // Filter clauses that have cross-references or are cross-referenced to form a focused graph
  const graphData = useMemo(() => {
    const clauseMap = new Map<string, ClauseDetail>();
    clauses.forEach((c) => clauseMap.set(c.clause_id, c));

    // Build unique cross-reference links
    const links: { source: string; target: string }[] = [];
    clauses.forEach((c) => {
      c.cross_references?.forEach((targetId) => {
        if (clauseMap.has(targetId)) {
          links.push({ source: c.clause_id, target: targetId });
        }
      });
    });

    return { clauses, clauseMap, links };
  }, [clauses]);

  useEffect(() => {
    if (viewMode !== '3d' || !mountRef.current || graphData.clauses.length === 0) return;

    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight || 420;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8f8f5); // Warm paper background matching the theme

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 5, 26);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 2. Lighting (Restrained and natural)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
    dirLight.position.set(10, 20, 15);
    scene.add(dirLight);

    // 3. Compute 3D Positions (Structured legal cylinder by Part 1..12)
    const nodePositions = new Map<string, THREE.Vector3>();
    const nodeMeshes = new Map<string, THREE.Mesh>();
    const partGroups = new Map<number, ClauseDetail[]>();

    graphData.clauses.forEach((c) => {
      const part = c.part_number || 1;
      if (!partGroups.has(part)) partGroups.set(part, []);
      partGroups.get(part)!.push(c);
    });

    const cylinderRadius = 9.0;
    const heightScale = 1.6;

    partGroups.forEach((partClauses, part) => {
      const y = (6.5 - part) * heightScale;
      const count = partClauses.length;
      partClauses.forEach((c, idx) => {
        const angle = (idx / count) * Math.PI * 2 + (part * 0.3);
        const x = Math.cos(angle) * cylinderRadius;
        const z = Math.sin(angle) * cylinderRadius;
        const pos = new THREE.Vector3(x, y, z);
        nodePositions.set(c.clause_id, pos);

        // Node Geometry & Materials
        const isSelected = c.clause_id === selectedClauseId;
        const isAmended = c.is_amended;
        const geometry = new THREE.SphereGeometry(isSelected ? 0.45 : 0.28, 16, 16);

        let color = 0x252a32; // Default charcoal
        if (isSelected) {
          color = 0x137c72; // Evidence teal
        } else if (isAmended) {
          color = 0x3458db; // Accent cobalt for amended clauses
        }

        const material = new THREE.MeshStandardMaterial({
          color,
          roughness: 0.3,
          metalness: 0.2,
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(pos);
        mesh.userData = { clauseId: c.clause_id };
        scene.add(mesh);
        nodeMeshes.set(c.clause_id, mesh);
      });
    });

    // 4. Edges (Cross-references)
    const lineGroup = new THREE.Group();
    graphData.links.forEach((link) => {
      const srcPos = nodePositions.get(link.source);
      const tgtPos = nodePositions.get(link.target);
      if (srcPos && tgtPos) {
        const points = [srcPos, tgtPos];
        const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
        const isHighlight =
          link.source === selectedClauseId || link.target === selectedClauseId;

        const lineMat = new THREE.LineBasicMaterial({
          color: isHighlight ? 0x137c72 : 0xd8d8d2,
          transparent: true,
          opacity: isHighlight ? 0.9 : 0.4,
          linewidth: isHighlight ? 2 : 1,
        });

        const line = new THREE.Line(lineGeo, lineMat);
        lineGroup.add(line);
      }
    });
    scene.add(lineGroup);

    // 5. Delicate Part Rings / Guideline Manifold
    const ringsGroup = new THREE.Group();
    for (let part = 1; part <= 12; part++) {
      const ringGeo = new THREE.BufferGeometry();
      const ringPoints: THREE.Vector3[] = [];
      const segments = 64;
      const y = (6.5 - part) * heightScale;
      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        ringPoints.push(
          new THREE.Vector3(Math.cos(theta) * cylinderRadius, y, Math.sin(theta) * cylinderRadius)
        );
      }
      ringGeo.setFromPoints(ringPoints);
      const ringMat = new THREE.LineBasicMaterial({
        color: 0xe5e5e0,
        transparent: true,
        opacity: 0.5,
      });
      ringsGroup.add(new THREE.Line(ringGeo, ringMat));
    }
    scene.add(ringsGroup);

    // 6. Raycasting & Interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let rotationVelocityX = 0;
    let rotationVelocityY = 0;

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
      container.setPointerCapture?.(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / height) * 2 + 1;

      if (isDragging) {
        const deltaX = e.clientX - prevMouseX;
        const deltaY = e.clientY - prevMouseY;
        rotationVelocityY = deltaX * 0.005;
        rotationVelocityX = deltaY * 0.003;
        scene.rotation.y += rotationVelocityY;
        scene.rotation.x = Math.max(-0.6, Math.min(0.6, scene.rotation.x + rotationVelocityX));
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;
      } else {
        // Hover Raycasting
        raycaster.setFromCamera(mouse, camera);
        const meshesArray = Array.from(nodeMeshes.values());
        const intersects = raycaster.intersectObjects(meshesArray);
        if (intersects.length > 0) {
          const hoveredId = intersects[0].object.userData.clauseId;
          setHoveredClauseId(hoveredId);
          container.style.cursor = 'pointer';
        } else {
          setHoveredClauseId(null);
          container.style.cursor = 'grab';
        }
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      if (isDragging) {
        // If minimal movement, treat as click / tap
        const deltaX = Math.abs(e.clientX - prevMouseX);
        const deltaY = Math.abs(e.clientY - prevMouseY);
        if (deltaX < 5 && deltaY < 5) {
          raycaster.setFromCamera(mouse, camera);
          const meshesArray = Array.from(nodeMeshes.values());
          const intersects = raycaster.intersectObjects(meshesArray);
          if (intersects.length > 0) {
            const clickedId = intersects[0].object.userData.clauseId;
            onSelectClause(clickedId);
          }
        }
      }
      isDragging = false;
      try {
        container.releasePointerCapture?.(e.pointerId);
      } catch {
        // ignore if not captured
      }
    };

    container.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);

    // 7. Subtle Animation Loop (Apple damping & smooth settle)
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Gentle continuous ambient drift when not dragging
      if (!isDragging) {
        scene.rotation.y += 0.0012;
      }

      renderer.render(scene, camera);
    };
    animate();

    // Resize handler
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight || 420;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [viewMode, graphData, selectedClauseId, onSelectClause]);

  const selectedClause = selectedClauseId
    ? graphData.clauseMap.get(selectedClauseId)
    : null;

  return (
    <div className="bg-white border border-[#E5E5E0] shadow-subtle overflow-hidden">
      {/* Top Header Controls */}
      <div className="p-3.5 border-b border-[#E5E5E0] bg-[#F8F8F5] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#3458DB]" />
          <h3 className="meta-caps text-[#171A21]">
            Statutory Cross-Reference Graph
          </h3>
          <span className="font-mono text-[9px] text-[#777E89] border border-[#E5E5E0] px-1.5 py-0.2 bg-white">
            {graphData.clauses.length} Nodes &bull; {graphData.links.length} Citations
          </span>
        </div>

        {/* View Mode Toggle (3D vs Accessible 2D) */}
        <div className="flex items-center gap-2">
          <div className="inline-flex border border-[#E5E5E0] bg-white p-0.5 text-xs font-mono">
            <button
              type="button"
              onClick={() => setViewMode('3d')}
              className={`px-2 py-0.5 transition-colors ${
                viewMode === '3d'
                  ? 'bg-[#171A21] text-white font-medium'
                  : 'text-[#777E89] hover:text-[#171A21]'
              }`}
            >
              3D Spatial Graph
            </button>
            <button
              type="button"
              onClick={() => setViewMode('2d')}
              className={`px-2 py-0.5 transition-colors ${
                viewMode === '2d'
                  ? 'bg-[#171A21] text-white font-medium'
                  : 'text-[#777E89] hover:text-[#171A21]'
              }`}
            >
              2D Dependency Matrix
            </button>
          </div>
        </div>
      </div>

      {/* Main View Area */}
      {viewMode === '3d' ? (
        <div className="relative">
          <div
            ref={mountRef}
            style={{ touchAction: 'pan-y' }}
            className="w-full h-72 sm:h-96 bg-[#F8F8F5] cursor-grab active:cursor-grabbing"
          />

          {/* Discreet 3D Legend (hidden on small mobile screens to maximize canvas space) */}
          <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md border border-[#E5E5E0] p-2 text-[10px] font-mono space-y-1 text-[#252A32] shadow-subtle hidden sm:block">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#252A32]" />
              <span>Standard Clause (§1.1 – §12.2)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#3458DB]" />
              <span>Amended Provision (No. 2026-01)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#137C72]" />
              <span>Selected Node</span>
            </div>
            <p className="text-[9px] text-[#777E89] pt-1 border-t border-[#E5E5E0]">
              Drag to orbit &bull; Click node to inspect
            </p>
          </div>

          {/* Hover Clause Indicator */}
          {hoveredClauseId && (
            <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md border border-[#E5E5E0] px-2.5 py-1 text-xs font-mono text-[#171A21] shadow-subtle flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[#3458DB]" />
              <span>{hoveredClauseId}</span>
              <span className="text-[10px] text-[#777E89]">(Click to inspect)</span>
            </div>
          )}
        </div>
      ) : (
        /* Accessible 2D Dependency List Fallback */
        <div className="p-4 max-h-96 overflow-y-auto space-y-3 bg-[#F8F8F5]">
          <p className="text-xs text-[#777E89] font-mono">
            Accessible 2D tabular index of cross-reference dependencies across all 12 policy parts:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {graphData.clauses
              .filter((c) => c.cross_references && c.cross_references.length > 0)
              .map((c) => (
                <div
                  key={c.clause_id}
                  onClick={() => onSelectClause(c.clause_id)}
                  className={`p-2.5 border bg-white cursor-pointer transition-all ${
                    selectedClauseId === c.clause_id
                      ? 'border-[#137C72] bg-[#EFF8F7]'
                      : 'border-[#E5E5E0] hover:border-[#3458DB]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-semibold text-[#171A21]">
                      {c.clause_id}
                    </span>
                    {c.is_amended && (
                      <span className="font-mono text-[9px] px-1 py-0.2 bg-[#EFF8F7] border border-[#B3DFDA] text-[#137C72]">
                        AMENDED
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-medium text-[#252A32] truncate">{c.title}</p>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {c.cross_references.map((xref) => (
                      <span
                        key={xref}
                        className="font-mono text-[9px] px-1 py-0.2 bg-[#F8F8F5] border border-[#E5E5E0] text-[#777E89]"
                      >
                        &rarr; {xref}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Selected Node Bottom Bar */}
      {selectedClause && (
        <div className="p-3 bg-white border-t border-[#E5E5E0] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-[#171A21] px-1.5 py-0.5 bg-[#F8F8F5] border border-[#E5E5E0]">
              {selectedClause.clause_id}
            </span>
            <span className="font-medium text-[#171A21]">{selectedClause.title}</span>
            <span className="text-[#777E89] hidden sm:inline">&bull; Part {selectedClause.part_number}</span>
          </div>
          <button
            type="button"
            onClick={() => onSelectClause(selectedClause.clause_id)}
            className="meta-caps text-[#3458DB] hover:underline"
          >
            Open Statutory Drawer &rarr;
          </button>
        </div>
      )}
    </div>
  );
};
