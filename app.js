// 3D 앱 초기화
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, starting 3D app...');
    init3DApp();
});

function showError(message) {
    const container = document.getElementById('container');
    if (container) {
        container.innerHTML = `<div style="color: red; padding: 20px; text-align: center; background: rgba(0,0,0,0.8); color: white; border-radius: 10px; margin: 20px;">${message}</div>`;
    }
}

function init3DApp() {
    // Three.js 로딩 체크
    if (typeof window.THREE === 'undefined') {
        console.error('Three.js not loaded');
        showError('3D 라이브러리 로드 실패 - 인터넷 연결을 확인하고 새로고침해주세요');
        return;
    }
    
    console.log('Three.js loaded successfully');
    
    try {
        const THREE = window.THREE;

        // Scene, Camera, Renderer 설정
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xFFFFFF);

        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 2, 5);

        // 렌더러 설정
        let renderer;
        try {
            renderer = new THREE.WebGLRenderer({ 
                antialias: true,
                alpha: true,
                powerPreference: "high-performance"
            });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            document.getElementById('container').appendChild(renderer.domElement);
            console.log('WebGL renderer initialized successfully');
        } catch (error) {
            console.error('WebGL initialization failed:', error);
            showError('WebGL 초기화에 실패했습니다. 브라우저를 새로고침하거나 다른 브라우저를 사용해주세요.');
            return;
        }

        // 조명 설정
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 25, 10);
        directionalLight.castShadow = true;
        scene.add(directionalLight);

        // 바닥 생성
        const floorGeometry = new THREE.PlaneGeometry(50, 50);
        const floorMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xD3D3D3,
            roughness: 0.2,
            metalness: 0.3
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        scene.add(floor);

        // 간단한 벽들
        function createWall(width, height, x, y, z, rotationY = 0) {
            const wallGeometry = new THREE.BoxGeometry(width, height, 0.3);
            const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xF5F5F5 });
            const wall = new THREE.Mesh(wallGeometry, wallMaterial);
            wall.position.set(x, y, z);
            wall.rotation.y = rotationY;
            wall.receiveShadow = true;
            return wall;
        }

        scene.add(createWall(50, 8, 0, 4, -25));
        scene.add(createWall(50, 8, 0, 4, 25));
        scene.add(createWall(50, 8, -25, 4, 0, Math.PI / 2));
        scene.add(createWall(50, 8, 25, 4, 0, Math.PI / 2));

        // 천장
        const ceilingGeometry = new THREE.PlaneGeometry(50, 50);
        const ceilingMaterial = new THREE.MeshStandardMaterial({ color: 0xFAFAFA });
        const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
        ceiling.rotation.x = Math.PI / 2;
        ceiling.position.y = 8;
        scene.add(ceiling);

        // 간단한 선반들
        function createSimpleShelf(x, z) {
            const shelfGroup = new THREE.Group();
            const shelfGeometry = new THREE.BoxGeometry(3, 1.5, 0.8);
            const shelfMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
            const shelf = new THREE.Mesh(shelfGeometry, shelfMaterial);
            shelf.position.y = 0.75;
            shelf.castShadow = true;
            shelfGroup.add(shelf);
            shelfGroup.position.set(x, 0, z);
            return shelfGroup;
        }

        scene.add(createSimpleShelf(-8, -5));
        scene.add(createSimpleShelf(-8, 0));
        scene.add(createSimpleShelf(-8, 5));
        scene.add(createSimpleShelf(8, -5));
        scene.add(createSimpleShelf(8, 0));
        scene.add(createSimpleShelf(8, 5));

        // 간단한 상품들
        const productColors = [0xFF0000, 0x0000FF, 0x00FF00, 0xFFFF00];
        for (let i = 0; i < 20; i++) {
            const boxGeometry = new THREE.BoxGeometry(0.3, 0.4, 0.3);
            const boxMaterial = new THREE.MeshStandardMaterial({ 
                color: productColors[Math.floor(Math.random() * productColors.length)]
            });
            const box = new THREE.Mesh(boxGeometry, boxMaterial);
            box.position.set(
                (Math.random() - 0.5) * 10,
                1.5 + Math.random() * 2,
                (Math.random() - 0.5) * 10
            );
            box.castShadow = true;
            scene.add(box);
        }

        // 아바타
        const avatarGeometry = new THREE.SphereGeometry(0.5, 32, 32);
        const avatarMaterial = new THREE.MeshStandardMaterial({ color: 0x4169E1 });
        const avatar = new THREE.Mesh(avatarGeometry, avatarMaterial);
        avatar.position.set(0, 1, 10);
        avatar.castShadow = true;
        scene.add(avatar);

        // 카메라 설정
        camera.position.copy(avatar.position);
        camera.position.y += 1.5;

        // 키보드 컨트롤
        const keys = { forward: false, backward: false, left: false, right: false };
        const speed = 0.15;

        document.addEventListener('keydown', (event) => {
            switch (event.code) {
                case 'KeyW': case 'ArrowUp': keys.forward = true; break;
                case 'KeyS': case 'ArrowDown': keys.backward = true; break;
                case 'KeyA': case 'ArrowLeft': keys.left = true; break;
                case 'KeyD': case 'ArrowRight': keys.right = true; break;
            }
        });

        document.addEventListener('keyup', (event) => {
            switch (event.code) {
                case 'KeyW': case 'ArrowUp': keys.forward = false; break;
                case 'KeyS': case 'ArrowDown': keys.backward = false; break;
                case 'KeyA': case 'ArrowLeft': keys.left = false; break;
                case 'KeyD': case 'ArrowRight': keys.right = false; break;
            }
        });

        // 애니메이션 루프
        function animate() {
            requestAnimationFrame(animate);
            
            const direction = new THREE.Vector3();
            if (keys.forward) direction.z -= 1;
            if (keys.backward) direction.z += 1;
            if (keys.left) direction.x -= 1;
            if (keys.right) direction.x += 1;
            
            direction.normalize();
            
            if (direction.length() > 0) {
                avatar.position.x += direction.x * speed;
                avatar.position.z += direction.z * speed;
                
                avatar.position.x = Math.max(-20, Math.min(20, avatar.position.x));
                avatar.position.z = Math.max(-20, Math.min(20, avatar.position.z));
            }
            
            camera.position.copy(avatar.position);
            camera.position.y += 1.5;
            
            renderer.render(scene, camera);
        }

        animate();
        console.log('3D app initialized successfully');

    } catch (error) {
        console.error('3D app initialization error:', error);
        showError('3D 앱 초기화 오류: ' + error.message);
    }
}