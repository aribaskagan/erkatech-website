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

    function createFieldLine(x, z, direction) {
        const points = new Float32Array(33);
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute("position", new THREE.BufferAttribute(points, 3));
        const material = new THREE.LineBasicMaterial({ color: 0x5d5d59, transparent: true, opacity: 0 });
        const line = new THREE.Line(geometry, material);
        root.add(line);
        fieldLines.push({ x, z, direction, points, geometry, material });
    }

    for (let row = 0; row < matrix; row += 1) {
        for (let col = 0; col < matrix; col += 1) {
            const x = (col - 1.5) * spacingX;
            const z = (row - 1.5) * spacingZ;
            createFieldLine(x, z, (row + col) % 2 === 0 ? 1 : -1);
        }
    }

    function updateFieldLine(field, opening, pulse) {
        const startY = magnetYClosed + opening * (magnetYOpen - magnetYClosed) - 0.23;
        const endY = 0.08;
        const bend = (0.22 + opening * 0.58 + pulse * 0.04) * field.direction;
        for (let i = 0; i <= 10; i += 1) {
            const t = i / 10;
            const offset = i * 3;
            field.points[offset] = field.x + bend * Math.sin(Math.PI * t);
            field.points[offset + 1] = startY + (endY - startY) * t;
            field.points[offset + 2] = field.z + 0.18 * Math.sin(Math.PI * t);
        }
        field.geometry.attributes.position.needsUpdate = true;
        field.material.opacity = opening * (0.3 + pulse * 0.1);
    }

    function updateScene(milliseconds) {
        const opening = smoothstep(0.08, 0.72, scrollProgress);
        const pulse = reducedMotion ? 0.5 : (Math.sin(milliseconds * 0.00125) + 1) * 0.5;
        magnets.position.y = opening * (magnetYOpen - magnetYClosed);
        magnetMaterials.forEach((material, index) => {
            material.emissiveIntensity = 0.035 + opening * 0.045 + pulse * (index % 3 === 0 ? 0.012 : 0.004);
        });
        fieldLines.forEach((field) => updateFieldLine(field, opening, pulse));
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
