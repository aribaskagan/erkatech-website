(function () {
    "use strict";

    const section = document.getElementById("magnet-matrix");
    const stage = document.getElementById("magnet-stage");
    const canvas = document.getElementById("magnet-canvas");
    const caption = document.getElementById("magnet-caption");

    if (!section || !stage || !canvas || !window.THREE) {
        if (stage) stage.classList.add("is-fallback");
        return;
    }

    const THREE = window.THREE;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const magnetYClosed = 0.42;
    const magnetYOpen = 2.12;
    const matrix = 4;
    const spacingX = 2.08;
    const spacingZ = 1.5;
    const fieldLines = [];
    let scrollProgress = 0;
    let isVisible = false;
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
    camera.position.set(10.8, 8.4, 10.6);
    camera.lookAt(0, 0.55, 0);

    const root = new THREE.Group();
    root.rotation.y = -0.23;
    scene.add(root);

    scene.add(new THREE.HemisphereLight(0xffffff, 0xbababa, 2.3));
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
    keyLight.position.set(6, 9, 5);
    scene.add(keyLight);
    const fillLight = new THREE.DirectionalLight(0xb8b8b3, 1.05);
    fillLight.position.set(-7, 4, -3);
    scene.add(fillLight);

    const sensorPlane = new THREE.Mesh(
        new THREE.BoxGeometry(10.9, 0.24, 7.5),
        new THREE.MeshStandardMaterial({ color: 0xe9e9e4, roughness: 0.82, metalness: 0 })
    );
    sensorPlane.position.y = -0.11;
    root.add(sensorPlane);

    const sensorGrid = new THREE.GridHelper(11.5, 24, 0x92928d, 0xb8b8b3);
    sensorGrid.position.y = 0.018;
    sensorGrid.material.transparent = true;
    sensorGrid.material.opacity = 0.42;
    root.add(sensorGrid);

    const magnets = new THREE.Group();
    const magnetMaterials = [];
    const magnetGeometry = new THREE.BoxGeometry(1.32, 0.42, 0.95);
    for (let row = 0; row < matrix; row += 1) {
        for (let col = 0; col < matrix; col += 1) {
            const shade = (row + col) % 2 === 0 ? 0x181818 : 0x343432;
            const material = new THREE.MeshStandardMaterial({ color: shade, roughness: 0.56, metalness: 0.16, emissive: 0x050505 });
            const magnet = new THREE.Mesh(magnetGeometry, material);
            magnet.position.set((col - 1.5) * spacingX, magnetYClosed, (row - 1.5) * spacingZ);
            magnets.add(magnet);
            magnetMaterials.push(material);
        }
    }
    root.add(magnets);

    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(19, 15),
        new THREE.MeshBasicMaterial({ color: 0xe1e1dc })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.34;
    root.add(floor);

    function smoothstep(min, max, value) {
        const x = Math.min(Math.max((value - min) / (max - min), 0), 1);
        return x * x * (3 - 2 * x);
    }

    const arrowGeometry = new THREE.ConeGeometry(0.06, 0.18, 6);
    const arrowMaterial = new THREE.MeshBasicMaterial({ color: 0x171716, transparent: true, opacity: 0.82 });
    const arrowAxis = new THREE.Vector3(0, 1, 0);

    function createFieldLine(x, z, direction, lateral, depth, phase) {
        const points = new Float32Array(63);
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute("position", new THREE.BufferAttribute(points, 3));
        const material = new THREE.LineBasicMaterial({ color: 0x292927, transparent: true, opacity: 0 });
        const line = new THREE.Line(geometry, material);
        const arrow = new THREE.Mesh(arrowGeometry, arrowMaterial);
        arrow.visible = false;
        root.add(line);
        root.add(arrow);
        fieldLines.push({
            x, z, direction, lateral, depth, phase, points, geometry, material, arrow,
            point: new THREE.Vector3(), nextPoint: new THREE.Vector3(), tangent: new THREE.Vector3()
        });
    }

    for (let row = 0; row < matrix; row += 1) {
        for (let col = 0; col < matrix; col += 1) {
            const x = (col - 1.5) * spacingX;
            const z = (row - 1.5) * spacingZ;
            const direction = (row + col) % 2 === 0 ? 1 : -1;
            [
                [-0.34, -0.26], [-0.12, 0.2], [0.12, -0.2], [0.34, 0.26]
            ].forEach(([lateral, depth], index) => {
                createFieldLine(x, z, index % 2 === 0 ? direction : -direction, lateral, depth, row * 0.18 + col * 0.13 + index * 0.25);
            });
        }
    }

    function fieldPoint(field, t, opening, target) {
        const startY = magnetYClosed + opening * (magnetYOpen - magnetYClosed) - 0.23;
        const endY = 0.08;
        const bend = (0.26 + opening * 0.78) * field.direction;
        const arc = Math.sin(Math.PI * t);
        target.set(
            field.x + field.lateral * (1 - t) + bend * arc,
            startY + (endY - startY) * t,
            field.z + field.depth * (1 - t) + field.depth * 0.35 * arc
        );
    }

    function updateFieldLine(field, opening, pulse, milliseconds) {
        for (let i = 0; i <= 20; i += 1) {
            const offset = i * 3;
            fieldPoint(field, i / 20, opening, field.point);
            field.points[offset] = field.point.x;
            field.points[offset + 1] = field.point.y;
            field.points[offset + 2] = field.point.z;
        }
        field.geometry.attributes.position.needsUpdate = true;
        field.material.opacity = opening * (0.5 + pulse * 0.18);

        const flow = (milliseconds * 0.00009 + field.phase) % 1;
        const arrowT = field.direction > 0 ? flow : 1 - flow;
        const nextT = field.direction > 0
            ? Math.min(arrowT + 0.012, 1)
            : Math.max(arrowT - 0.012, 0);
        fieldPoint(field, arrowT, opening, field.point);
        fieldPoint(field, nextT, opening, field.nextPoint);
        field.tangent.subVectors(field.nextPoint, field.point).normalize();
        field.arrow.visible = opening > 0.06;
        field.arrow.position.copy(field.point);
        field.arrow.quaternion.setFromUnitVectors(arrowAxis, field.tangent);
    }

    function updateScene(milliseconds) {
        const opening = smoothstep(0.08, 0.72, scrollProgress);
        const pulse = reducedMotion ? 0.5 : (Math.sin(milliseconds * 0.00125) + 1) * 0.5;
        magnets.position.y = opening * (magnetYOpen - magnetYClosed);
        magnetMaterials.forEach((material, index) => {
            material.emissiveIntensity = 0.035 + opening * 0.045 + pulse * (index % 3 === 0 ? 0.012 : 0.004);
        });
        fieldLines.forEach((field) => updateFieldLine(field, opening, pulse, milliseconds));
        sensorGrid.material.opacity = 0.28 + opening * 0.22;
    }

    function updateScrollProgress() {
        const rect = section.getBoundingClientRect();
        const travel = rect.height - window.innerHeight;
        scrollProgress = travel > 0 ? Math.min(Math.max(-rect.top / travel, 0), 1) : 0;
        caption.classList.toggle("visible", scrollProgress > 0.34 && scrollProgress < 0.98);
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

    function render(milliseconds) {
        updateScene(milliseconds);
        renderer.render(scene, camera);
    }

    const observer = new IntersectionObserver((entries) => {
        isVisible = entries.some((entry) => entry.isIntersecting) && !document.hidden;
        if (isVisible) render(reducedMotion ? 0 : performance.now());
    }, { threshold: 0.1 });
    observer.observe(stage);

    let scrollTicking = false;
    window.addEventListener("scroll", () => {
        if (scrollTicking) return;
        window.requestAnimationFrame(() => {
            updateScrollProgress();
            if (isVisible) render(reducedMotion ? 0 : performance.now());
            scrollTicking = false;
        });
        scrollTicking = true;
    });
    window.addEventListener("resize", () => {
        resize();
        updateScrollProgress();
        render(reducedMotion ? 0 : performance.now());
    });
    document.addEventListener("visibilitychange", () => {
        isVisible = !document.hidden && stage.getBoundingClientRect().bottom > 0 && stage.getBoundingClientRect().top < window.innerHeight;
    });
    new ResizeObserver(resize).observe(stage);

    function animate(milliseconds) {
        window.requestAnimationFrame(animate);
        if (!isVisible || reducedMotion) return;
        render(milliseconds);
    }

    resize();
    updateScrollProgress();
    render(0);
    window.requestAnimationFrame(animate);
}());
