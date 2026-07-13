(function () {
    "use strict";

    const section = document.getElementById("panel-section");
    const stage = document.getElementById("surface-stage");
    const canvas = document.getElementById("surface-canvas");

    if (!section || !stage || !canvas || !window.THREE) {
        if (stage) stage.classList.add("is-fallback");
        return;
    }

    const THREE = window.THREE;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const surfaceWidth = 10;
    const surfaceDepth = 7;
    const segmentsX = 64;
    const segmentsZ = 44;
    const mapColumns = 36;
    const mapRows = 25;
    const contactPoint = new THREE.Vector2(-0.35, 0.1);
    const baseColor = new THREE.Color(0xf5f5f1);
    const contactColor = new THREE.Color(0x292927);
    const mapLight = new THREE.Color(0xe8e8e3);
    const mapDark = new THREE.Color(0x20201e);
    const wireColor = new THREE.Color(0x9c9c97);

    let renderer;
    try {
        renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "high-performance" });
    } catch (error) {
        stage.classList.add("is-fallback");
        return;
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xefefeb);
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    const sceneRoot = new THREE.Group();
    sceneRoot.rotation.y = -0.22;
    scene.add(sceneRoot);

    scene.add(new THREE.HemisphereLight(0xffffff, 0xafafa9, 2.35));
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.55);
    keyLight.position.set(4.5, 8, 5);
    scene.add(keyLight);
    const rimLight = new THREE.DirectionalLight(0xb8b8b3, 1.1);
    rimLight.position.set(-6, 3, -4);
    scene.add(rimLight);

    const pedestal = new THREE.Mesh(
        new THREE.PlaneGeometry(18, 15),
        new THREE.MeshBasicMaterial({ color: 0xe7e7e2 })
    );
    pedestal.rotation.x = -Math.PI / 2;
    pedestal.position.y = -0.84;
    sceneRoot.add(pedestal);

    const geometry = new THREE.PlaneGeometry(surfaceWidth, surfaceDepth, segmentsX, segmentsZ);
    geometry.rotateX(-Math.PI / 2);
    const positions = geometry.attributes.position;
    const baseY = new Float32Array(positions.count);
    const vertexColors = new Float32Array(positions.count * 3);
    const workingColor = new THREE.Color();
    for (let i = 0; i < positions.count; i += 1) {
        baseY[i] = positions.getY(i);
        vertexColors[i * 3] = baseColor.r;
        vertexColors[i * 3 + 1] = baseColor.g;
        vertexColors[i * 3 + 2] = baseColor.b;
    }
    geometry.setAttribute("color", new THREE.BufferAttribute(vertexColors, 3));

    const surfaceMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.88,
        metalness: 0,
        vertexColors: true,
        transparent: true,
        opacity: 1
    });
    const surface = new THREE.Mesh(geometry, surfaceMaterial);
    sceneRoot.add(surface);

    const wireGroup = new THREE.Group();
    const wireLines = [];
    function createGridLine(horizontal, index, strong) {
        const steps = horizontal ? segmentsX : segmentsZ;
        const points = new Float32Array((steps + 1) * 3);
        const lineGeometry = new THREE.BufferGeometry();
        lineGeometry.setAttribute("position", new THREE.BufferAttribute(points, 3));
        const material = new THREE.LineBasicMaterial({
            color: strong ? 0x777773 : wireColor,
            transparent: true,
            opacity: strong ? 0.72 : 0.48
        });
        const line = new THREE.Line(lineGeometry, material);
        wireGroup.add(line);
        wireLines.push({ horizontal, index, steps, points, lineGeometry, material, baseOpacity: material.opacity });
    }
    for (let row = 0; row <= segmentsZ; row += 2) createGridLine(true, row, row % 10 === 0);
    for (let col = 0; col <= segmentsX; col += 2) createGridLine(false, col, col % 12 === 0);
    sceneRoot.add(wireGroup);

    const probe = new THREE.Group();
    const fingerShellMaterial = new THREE.MeshStandardMaterial({ color: 0xdededa, roughness: 0.62, metalness: 0.04, transparent: true });
    const fingerJointMaterial = new THREE.MeshStandardMaterial({ color: 0x242422, roughness: 0.5, metalness: 0.12, transparent: true });
    const fingerBase = new THREE.Mesh(
        new THREE.BoxGeometry(0.68, 0.52, 0.7),
        fingerShellMaterial
    );
    fingerBase.position.set(0, 0.9, -0.1);
    fingerBase.rotation.x = 0.25;
    probe.add(fingerBase);
    const upperJoint = new THREE.Mesh(
        new THREE.CylinderGeometry(0.23, 0.23, 0.62, 32),
        fingerJointMaterial
    );
    upperJoint.rotation.z = Math.PI / 2;
    upperJoint.position.set(0, 0.56, 0.04);
    probe.add(upperJoint);
    const upperPhalanx = new THREE.Mesh(
        new THREE.BoxGeometry(0.44, 0.62, 0.48),
        fingerShellMaterial
    );
    upperPhalanx.position.set(0, 0.25, 0.05);
    upperPhalanx.rotation.x = -0.38;
    probe.add(upperPhalanx);
    const lowerJoint = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18, 0.18, 0.5, 32),
        fingerJointMaterial
    );
    lowerJoint.rotation.z = Math.PI / 2;
    lowerJoint.position.set(0, -0.08, 0.1);
    probe.add(lowerJoint);
    const fingertipShell = new THREE.Mesh(
        new THREE.BoxGeometry(0.32, 0.42, 0.36),
        fingerShellMaterial
    );
    fingertipShell.position.set(0, -0.28, 0.11);
    fingertipShell.rotation.x = -0.45;
    probe.add(fingertipShell);
    const probePad = new THREE.Mesh(
        new THREE.CylinderGeometry(0.27, 0.27, 0.18, 48),
        new THREE.MeshStandardMaterial({ color: 0x252523, roughness: 0.58, transparent: true })
    );
    probePad.position.set(0, -0.54, 0.12);
    probe.add(probePad);
    probe.position.set(contactPoint.x, 1.1, contactPoint.y);
    sceneRoot.add(probe);

    const contourGroup = new THREE.Group();
    const contourMaterials = [];
    for (let i = 0; i < 5; i += 1) {
        const ring = new THREE.Mesh(
            new THREE.TorusGeometry(0.48 + i * 0.3, 0.018, 8, 80),
            new THREE.MeshBasicMaterial({ color: 0x262624, transparent: true, opacity: 0, depthWrite: false })
        );
        ring.rotation.x = Math.PI / 2;
        ring.position.set(contactPoint.x, 0.025, contactPoint.y);
        ring.scale.z = 0.78;
        contourGroup.add(ring);
        contourMaterials.push(ring.material);
    }
    sceneRoot.add(contourGroup);

    const cellWidth = surfaceWidth / mapColumns;
    const cellDepth = surfaceDepth / mapRows;
    const cellGeometry = new THREE.BoxGeometry(cellWidth * 0.82, 1, cellDepth * 0.82);
    const cellMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.64, metalness: 0, vertexColors: true, transparent: true, opacity: 0 });
    const pressureMap = new THREE.InstancedMesh(cellGeometry, cellMaterial, mapColumns * mapRows);
    pressureMap.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    pressureMap.frustumCulled = false;
    sceneRoot.add(pressureMap);

    const cellData = [];
    const cellMatrix = new THREE.Matrix4();
    const cellPosition = new THREE.Vector3();
    const cellScale = new THREE.Vector3();
    const cellQuaternion = new THREE.Quaternion();
    for (let row = 0; row < mapRows; row += 1) {
        for (let col = 0; col < mapColumns; col += 1) {
            const x = -surfaceWidth / 2 + cellWidth * (col + 0.5);
            const z = -surfaceDepth / 2 + cellDepth * (row + 0.5);
            cellData.push({ x, z, intensity: pressureAt(x, z) });
        }
    }

    function clamp(value) {
        return Math.min(Math.max(value, 0), 1);
    }

    function smoothstep(start, end, value) {
        const t = clamp((value - start) / (end - start));
        return t * t * (3 - 2 * t);
    }

    function pressureAt(x, z) {
        const dx = x - contactPoint.x;
        const dz = z - contactPoint.y;
        return Math.exp(-(dx * dx / 1.72 + dz * dz / 1.08));
    }

    function updateSurface(progress) {
        const pressProgress = smoothstep(0.04, 0.38, progress);
        const mapProgress = smoothstep(0.42, 0.72, progress);
        const probeFade = 1 - smoothstep(0.38, 0.56, progress);

        for (let i = 0; i < positions.count; i += 1) {
            const intensity = pressureAt(positions.getX(i), positions.getZ(i));
            const depth = intensity * pressProgress * 0.72;
            positions.setY(i, baseY[i] - depth);
            workingColor.lerpColors(baseColor, contactColor, intensity * pressProgress * 0.76);
            vertexColors[i * 3] = workingColor.r;
            vertexColors[i * 3 + 1] = workingColor.g;
            vertexColors[i * 3 + 2] = workingColor.b;
        }
        positions.needsUpdate = true;
        geometry.attributes.color.needsUpdate = true;
        geometry.computeVertexNormals();
        surfaceMaterial.opacity = 1 - mapProgress * 0.94;
        wireLines.forEach((entry) => {
            for (let step = 0; step <= entry.steps; step += 1) {
                const x = entry.horizontal
                    ? -surfaceWidth / 2 + (surfaceWidth * step / segmentsX)
                    : -surfaceWidth / 2 + (surfaceWidth * entry.index / segmentsX);
                const z = entry.horizontal
                    ? -surfaceDepth / 2 + (surfaceDepth * entry.index / segmentsZ)
                    : -surfaceDepth / 2 + (surfaceDepth * step / segmentsZ);
                const offset = step * 3;
                entry.points[offset] = x;
                entry.points[offset + 1] = -pressureAt(x, z) * pressProgress * 0.72 + 0.012;
                entry.points[offset + 2] = z;
            }
            entry.lineGeometry.attributes.position.needsUpdate = true;
            entry.material.opacity = entry.baseOpacity * (1 - mapProgress * 0.68);
        });

        probe.position.y = 1.1 - pressProgress * 1.08;
        fingerShellMaterial.opacity = probeFade;
        fingerJointMaterial.opacity = probeFade;
        probePad.material.opacity = probeFade;
        probe.visible = probeFade > 0.01;

        contourMaterials.forEach((material, index) => {
            material.opacity = (0.06 + index * 0.025) * smoothstep(0.24, 0.62, progress) * (1 - mapProgress * 0.35);
        });

        cellData.forEach((cell, index) => {
            const normalized = cell.intensity;
            const height = 0.035 + normalized * (0.16 + mapProgress * 1.35);
            cellPosition.set(cell.x, -0.02 + height / 2, cell.z);
            cellScale.set(1, height, 1);
            cellMatrix.compose(cellPosition, cellQuaternion, cellScale);
            pressureMap.setMatrixAt(index, cellMatrix);
            workingColor.lerpColors(mapLight, mapDark, Math.min(normalized * 1.12, 1));
            pressureMap.setColorAt(index, workingColor);
        });
        pressureMap.instanceMatrix.needsUpdate = true;
        if (pressureMap.instanceColor) pressureMap.instanceColor.needsUpdate = true;
        cellMaterial.opacity = mapProgress;
    }

    let scrollProgress = 0;
    const earlyCamera = new THREE.Vector3(10.4, 7.4, 10.6);
    const lateCamera = new THREE.Vector3(0.3, 12.9, 7.2);
    const cameraPosition = new THREE.Vector3();
    function updateCamera(progress) {
        const mapProgress = smoothstep(0.42, 0.9, progress);
        cameraPosition.lerpVectors(earlyCamera, lateCamera, mapProgress);
        camera.position.copy(cameraPosition);
        camera.lookAt(contactPoint.x, -0.2, contactPoint.y);
    }

    function updateScrollProgress() {
        const rect = section.getBoundingClientRect();
        const travel = rect.height - window.innerHeight;
        scrollProgress = travel > 0 ? clamp(-rect.top / travel) : 0;
    }

    function resize() {
        const width = stage.clientWidth;
        const height = stage.clientHeight;
        if (!width || !height) return;
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    }

    function render() {
        const progress = reducedMotion ? 0.76 : scrollProgress;
        updateSurface(progress);
        updateCamera(progress);
        renderer.render(scene, camera);
    }

    let isVisible = false;
    const observer = new IntersectionObserver((entries) => {
        isVisible = entries.some((entry) => entry.isIntersecting) && !document.hidden;
        if (isVisible) render();
    }, { threshold: 0.1 });
    observer.observe(stage);

    document.addEventListener("visibilitychange", () => {
        isVisible = !document.hidden && stage.getBoundingClientRect().bottom > 0 && stage.getBoundingClientRect().top < window.innerHeight;
        if (isVisible) render();
    });

    let scrollTicking = false;
    window.addEventListener("scroll", () => {
        if (scrollTicking) return;
        window.requestAnimationFrame(() => {
            updateScrollProgress();
            if (isVisible) render();
            scrollTicking = false;
        });
        scrollTicking = true;
    });

    new ResizeObserver(() => {
        resize();
        updateScrollProgress();
        render();
    }).observe(stage);

    resize();
    updateScrollProgress();
    render();
}());
