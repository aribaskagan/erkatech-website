(function () {
    "use strict";

    const stage = document.getElementById("surface-stage");
    const canvas = document.getElementById("surface-canvas");

    if (!stage || !canvas || !window.THREE) {
        if (stage) stage.classList.add("is-fallback");
        return;
    }

    const THREE = window.THREE;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const surfaceWidth = 10;
    const surfaceDepth = 7;
    const segmentsX = 72;
    const segmentsZ = 50;
    const motionSpeed = 1.5;
    const baseColor = new THREE.Color(0xf5f5f1);
    const contactColor = new THREE.Color(0x282828);
    const wireColor = new THREE.Color(0xa8a8a3);
    const touchPoints = [
        new THREE.Vector2(-2.65, -1.35),
        new THREE.Vector2(2.15, -0.8),
        new THREE.Vector2(0.55, 1.55),
        new THREE.Vector2(-1.2, 0.72)
    ];

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
    sceneRoot.rotation.y = -0.26;
    scene.add(sceneRoot);

    scene.add(new THREE.HemisphereLight(0xffffff, 0xb5b5b1, 2.2));
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.4);
    keyLight.position.set(4.5, 8, 5);
    scene.add(keyLight);
    const rimLight = new THREE.DirectionalLight(0xbdbdb8, 1.15);
    rimLight.position.set(-6, 3, -4);
    scene.add(rimLight);

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

    const surface = new THREE.Mesh(
        geometry,
        new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.88,
            metalness: 0,
            vertexColors: true
        })
    );
    sceneRoot.add(surface);

    const wireGroup = new THREE.Group();
    const wireLines = [];
    const gridMaterial = new THREE.LineBasicMaterial({ color: wireColor, transparent: true, opacity: 0.6 });

    function createGridLine(horizontal, index, strong) {
        const steps = horizontal ? segmentsX : segmentsZ;
        const points = new Float32Array((steps + 1) * 3);
        const lineGeometry = new THREE.BufferGeometry();
        lineGeometry.setAttribute("position", new THREE.BufferAttribute(points, 3));
        const line = new THREE.Line(lineGeometry, strong
            ? new THREE.LineBasicMaterial({ color: 0x797974, transparent: true, opacity: 0.74 })
            : gridMaterial
        );
        wireGroup.add(line);
        wireLines.push({ horizontal, index, steps, points, lineGeometry });
    }

    for (let row = 0; row <= segmentsZ; row += 2) createGridLine(true, row, row % 10 === 0);
    for (let col = 0; col <= segmentsX; col += 2) createGridLine(false, col, col % 12 === 0);
    sceneRoot.add(wireGroup);

    const contactGroup = new THREE.Group();
    const contactDisk = new THREE.Mesh(
        new THREE.CircleGeometry(0.66, 64),
        new THREE.MeshBasicMaterial({ color: 0x1d1d1d, transparent: true, opacity: 0.16, depthWrite: false })
    );
    contactDisk.rotation.x = -Math.PI / 2;
    contactGroup.add(contactDisk);

    const contactRing = new THREE.Mesh(
        new THREE.RingGeometry(0.68, 0.76, 64),
        new THREE.MeshBasicMaterial({ color: 0x181818, transparent: true, opacity: 0.5, side: THREE.DoubleSide, depthWrite: false })
    );
    contactRing.rotation.x = -Math.PI / 2;
    contactGroup.add(contactRing);
    sceneRoot.add(contactGroup);

    const pedestal = new THREE.Mesh(
        new THREE.PlaneGeometry(18, 15),
        new THREE.MeshBasicMaterial({ color: 0xe7e7e2 })
    );
    pedestal.rotation.x = -Math.PI / 2;
    pedestal.position.y = -0.82;
    sceneRoot.add(pedestal);

    function touchState(milliseconds) {
        const cycleDuration = 6700 / motionSpeed;
        const cycle = Math.floor(milliseconds / cycleDuration);
        const local = (milliseconds % cycleDuration) / cycleDuration;
        const envelope = Math.pow(Math.sin(Math.PI * local), 1.45);
        return {
            point: touchPoints[cycle % touchPoints.length],
            intensity: envelope,
            phase: local
        };
    }

    function deformationAt(x, z, touch) {
        const dx = x - touch.point.x;
        const dz = z - touch.point.y;
        const influence = Math.exp(-(dx * dx + dz * dz) / 1.22) * touch.intensity;
        return { influence, depth: influence * 0.68 };
    }

    function updateSurface(milliseconds) {
        const touch = touchState(milliseconds);
        for (let i = 0; i < positions.count; i += 1) {
            const result = deformationAt(positions.getX(i), positions.getZ(i), touch);
            positions.setY(i, baseY[i] - result.depth);
            workingColor.lerpColors(baseColor, contactColor, Math.min(result.influence * 0.86, 0.82));
            vertexColors[i * 3] = workingColor.r;
            vertexColors[i * 3 + 1] = workingColor.g;
            vertexColors[i * 3 + 2] = workingColor.b;
        }
        positions.needsUpdate = true;
        geometry.attributes.color.needsUpdate = true;
        geometry.computeVertexNormals();

        wireLines.forEach((entry) => {
            for (let step = 0; step <= entry.steps; step += 1) {
                const x = entry.horizontal
                    ? -surfaceWidth / 2 + (surfaceWidth * step / segmentsX)
                    : -surfaceWidth / 2 + (surfaceWidth * entry.index / segmentsX);
                const z = entry.horizontal
                    ? -surfaceDepth / 2 + (surfaceDepth * entry.index / segmentsZ)
                    : -surfaceDepth / 2 + (surfaceDepth * step / segmentsZ);
                const result = deformationAt(x, z, touch);
                const offset = step * 3;
                entry.points[offset] = x;
                entry.points[offset + 1] = -result.depth + 0.012;
                entry.points[offset + 2] = z;
            }
            entry.lineGeometry.attributes.position.needsUpdate = true;
        });

        contactGroup.visible = touch.intensity > 0.015;
        contactGroup.position.set(touch.point.x, -touch.intensity * 0.69 + 0.025, touch.point.y);
        const ringScale = 0.82 + touch.intensity * 0.5 + Math.sin(milliseconds * 0.004) * 0.018;
        contactDisk.scale.setScalar(0.9 + touch.intensity * 0.48);
        contactRing.scale.setScalar(ringScale);
        contactDisk.material.opacity = 0.05 + touch.intensity * 0.15;
        contactRing.material.opacity = 0.18 + touch.intensity * 0.35;
    }

    function resize() {
        const width = stage.clientWidth;
        const height = stage.clientHeight;
        if (!width || !height) return;
        const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
        renderer.setPixelRatio(pixelRatio);
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    }

    let isVisible = false;
    function setCamera(milliseconds) {
        const orbit = milliseconds * (Math.PI * 2 / (36000 / motionSpeed)) + 0.55;
        const radius = 12.4;
        camera.position.set(Math.cos(orbit) * radius, 9.6, Math.sin(orbit) * radius);
        camera.lookAt(0, -0.14, 0);
    }

    const observer = new IntersectionObserver((entries) => {
        isVisible = entries.some((entry) => entry.isIntersecting) && !document.hidden;
        if (isVisible && reducedMotion) render(2200);
    }, { threshold: 0.1 });
    observer.observe(stage);

    document.addEventListener("visibilitychange", () => {
        isVisible = !document.hidden && stage.getBoundingClientRect().bottom > 0 && stage.getBoundingClientRect().top < window.innerHeight;
        if (isVisible && reducedMotion) render(2200);
    });

    new ResizeObserver(resize).observe(stage);

    function render(milliseconds) {
        updateSurface(milliseconds);
        setCamera(reducedMotion ? 2200 : milliseconds);
        renderer.render(scene, camera);
    }

    function animate(milliseconds) {
        window.requestAnimationFrame(animate);
        if (!isVisible || reducedMotion) return;
        render(milliseconds);
    }

    resize();
    render(2200);
    window.requestAnimationFrame(animate);
}());
