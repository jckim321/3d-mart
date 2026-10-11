// Firebase 초기화
const firebaseConfig = {
    apiKey: "AIzaSyCYQWb8dEno__POur0UABfi0F9JR4i_XQw",
    authDomain: "dive-travel-9dcf7.firebaseapp.com",
    projectId: "dive-travel-9dcf7",
    storageBucket: "dive-travel-9dcf7.firebasestorage.app",
    messagingSenderId: "996020953462",
    appId: "1:996020953462:web:81c9bf7db384321c335a57",
    measurementId: "G-W724QN8LBY"
};

// Firebase 초기화
if (typeof firebase !== 'undefined') {
    firebase.initializeApp(firebaseConfig);
    console.log('Firebase initialized');
}

// 3D 앱 초기화
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, starting 3D app...');
    init3DApp();
    initUploadUI();
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
        window.scene = scene; // 전역 변수로 저장

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
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
        directionalLight.position.set(10, 25, 10);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        scene.add(directionalLight);

        // 천장 조명
        function createCeilingLight(x, z) {
            const lightGroup = new THREE.Group();
            
            // 조명 fixture
            const fixtureGeometry = new THREE.BoxGeometry(2, 0.1, 0.5);
            const fixtureMaterial = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });
            const fixture = new THREE.Mesh(fixtureGeometry, fixtureMaterial);
            fixture.position.y = 7.9;
            lightGroup.add(fixture);
            
            // 실제 조명
            const light = new THREE.PointLight(0xFFFFE0, 0.8, 20);
            light.position.set(0, 7.5, 0);
            light.castShadow = true;
            lightGroup.add(light);
            
            lightGroup.position.set(x, 0, z);
            return lightGroup;
        }

        // 천장 조명 배치
        for (let x = -15; x <= 15; x += 10) {
            for (let z = -15; z <= 15; z += 10) {
                scene.add(createCeilingLight(x, z));
            }
        }

        // 바닥 생성 (타일 패턴)
        const floorGeometry = new THREE.PlaneGeometry(50, 50);
        const floorMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xE8E8E8,
            roughness: 0.3,
            metalness: 0.1
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        scene.add(floor);

        // 타일 그리드
        const gridHelper = new THREE.GridHelper(50, 25, 0xC0C0C0, 0xD0D0D0);
        gridHelper.position.y = 0.01;
        scene.add(gridHelper);

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

        // 계산대
        function createCounter(x, z) {
            const counterGroup = new THREE.Group();
            
            // 계산대 본체
            const counterGeometry = new THREE.BoxGeometry(4, 1.2, 1.5);
            const counterMaterial = new THREE.MeshStandardMaterial({ color: 0x4A4A4A });
            const counter = new THREE.Mesh(counterGeometry, counterMaterial);
            counter.position.y = 0.6;
            counter.castShadow = true;
            counter.receiveShadow = true;
            counterGroup.add(counter);
            
            // 계산대 상판
            const topGeometry = new THREE.BoxGeometry(4.2, 0.1, 1.7);
            const topMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
            const top = new THREE.Mesh(topGeometry, topMaterial);
            top.position.y = 1.25;
            top.castShadow = true;
            counterGroup.add(top);
            
            // POS 단말기
            const posGeometry = new THREE.BoxGeometry(0.5, 0.4, 0.3);
            const posMaterial = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
            const pos = new THREE.Mesh(posGeometry, posMaterial);
            pos.position.set(0, 1.5, 0.4);
            pos.castShadow = true;
            counterGroup.add(pos);
            
            // 화면
            const screenGeometry = new THREE.BoxGeometry(0.4, 0.25, 0.05);
            const screenMaterial = new THREE.MeshStandardMaterial({ color: 0x87CEEB, emissive: 0x87CEEB, emissiveIntensity: 0.3 });
            const screen = new THREE.Mesh(screenGeometry, screenMaterial);
            screen.position.set(0, 1.55, 0.56);
            counterGroup.add(screen);
            
            counterGroup.position.set(x, 0, z);
            return counterGroup;
        }

        scene.add(createCounter(0, -18));

        // 냉장고/냉동고 섹션
        function createFridge(x, z, isFreezer = false) {
            const fridgeGroup = new THREE.Group();
            const height = isFreezer ? 2.5 : 2.2;
            const color = isFreezer ? 0xE8E8E8 : 0xF0F8FF;
            
            // 냉장고 본체
            const fridgeGeometry = new THREE.BoxGeometry(2, height, 1);
            const fridgeMaterial = new THREE.MeshStandardMaterial({ color: color });
            const fridge = new THREE.Mesh(fridgeGeometry, fridgeMaterial);
            fridge.position.y = height / 2;
            fridge.castShadow = true;
            fridge.receiveShadow = true;
            fridgeGroup.add(fridge);
            
            // 유리문
            const doorGeometry = new THREE.BoxGeometry(1.9, height - 0.2, 0.05);
            const doorMaterial = new THREE.MeshStandardMaterial({ 
                color: 0xADD8E6, 
                transparent: true, 
                opacity: 0.4,
                metalness: 0.3,
                roughness: 0.1
            });
            const door = new THREE.Mesh(doorGeometry, doorMaterial);
            door.position.set(0, height / 2, 0.5);
            fridgeGroup.add(door);
            
            // 손잡이
            const handleGeometry = new THREE.BoxGeometry(0.05, 0.5, 0.05);
            const handleMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
            const handle = new THREE.Mesh(handleGeometry, handleMaterial);
            handle.position.set(0.8, height / 2, 0.55);
            fridgeGroup.add(handle);
            
            fridgeGroup.position.set(x, 0, z);
            return fridgeGroup;
        }

        // 냉장고 배치
        for (let i = 0; i < 3; i++) {
            scene.add(createFridge(-15, -10 + i * 3, false));
            scene.add(createFridge(-15, -1 + i * 3, true));
        }

        // 개선된 선반들
        function createShelf(x, z, rotation = 0) {
            const shelfGroup = new THREE.Group();
            
            // 선반 프레임
            const frameGeometry = new THREE.BoxGeometry(3.5, 1.8, 1);
            const frameMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
            const frame = new THREE.Mesh(frameGeometry, frameMaterial);
            frame.position.y = 0.9;
            frame.castShadow = true;
            frame.receiveShadow = true;
            shelfGroup.add(frame);
            
            // 선반 층 (3층)
            for (let i = 0; i < 3; i++) {
                const shelfGeometry = new THREE.BoxGeometry(3.3, 0.05, 0.8);
                const shelfMaterial = new THREE.MeshStandardMaterial({ color: 0xA0522D });
                const shelf = new THREE.Mesh(shelfGeometry, shelfMaterial);
                shelf.position.set(0, 0.3 + i * 0.7, 0);
                shelf.castShadow = true;
                shelfGroup.add(shelf);
            }
            
            shelfGroup.position.set(x, 0, z);
            shelfGroup.rotation.y = rotation;
            return shelfGroup;
        }

        // 선반 배치
        scene.add(createShelf(10, -10));
        scene.add(createShelf(10, -5));
        scene.add(createShelf(10, 0));
        scene.add(createShelf(10, 5));
        scene.add(createShelf(10, 10));
        
        // 뒷쪽 선반
        scene.add(createShelf(-5, 15, Math.PI));
        scene.add(createShelf(0, 15, Math.PI));
        scene.add(createShelf(5, 15, Math.PI));

        // 야채/과일 코너
        function createProduceStand(x, z) {
            const standGroup = new THREE.Group();
            
            // 진열대
            const standGeometry = new THREE.BoxGeometry(3, 0.8, 2);
            const standMaterial = new THREE.MeshStandardMaterial({ color: 0x90EE90 });
            const stand = new THREE.Mesh(standGeometry, standMaterial);
            stand.position.y = 0.4;
            stand.castShadow = true;
            stand.receiveShadow = true;
            standGroup.add(stand);
            
            // 파라솔
            const poleGeometry = new THREE.CylinderGeometry(0.05, 0.05, 2, 8);
            const poleMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
            const pole = new THREE.Mesh(poleGeometry, poleMaterial);
            pole.position.set(0, 1.4, 0);
            standGroup.add(pole);
            
            const umbrellaGeometry = new THREE.ConeGeometry(1.5, 0.5, 8);
            const umbrellaMaterial = new THREE.MeshStandardMaterial({ color: 0xFF6347 });
            const umbrella = new THREE.Mesh(umbrellaGeometry, umbrellaMaterial);
            umbrella.position.set(0, 2.3, 0);
            standGroup.add(umbrella);
            
            standGroup.position.set(x, 0, z);
            return standGroup;
        }

        scene.add(createProduceStand(15, 0));

        // 문/출입구
        function createDoor(x, z, rotation = 0) {
            const doorGroup = new THREE.Group();
            
            // 문틀
            const frameGeometry = new THREE.BoxGeometry(2.2, 3.5, 0.3);
            const frameMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
            const frame = new THREE.Mesh(frameGeometry, frameMaterial);
            frame.position.y = 1.75;
            frame.castShadow = true;
            doorGroup.add(frame);
            
            // 유리문
            const doorGeometry = new THREE.BoxGeometry(2, 3, 0.1);
            const doorMaterial = new THREE.MeshStandardMaterial({ 
                color: 0x87CEEB, 
                transparent: true, 
                opacity: 0.5,
                metalness: 0.2,
                roughness: 0.1
            });
            const door = new THREE.Mesh(doorGeometry, doorMaterial);
            door.position.y = 1.75;
            door.position.z = 0.1;
            doorGroup.add(door);
            
            // 손잡이
            const handleGeometry = new THREE.BoxGeometry(0.1, 0.4, 0.1);
            const handleMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
            const handle = new THREE.Mesh(handleGeometry, handleMaterial);
            handle.position.set(0.8, 1.5, 0.15);
            doorGroup.add(handle);
            
            doorGroup.position.set(x, 0, z);
            doorGroup.rotation.y = rotation;
            return doorGroup;
        }

        scene.add(createDoor(0, -24.7, 0));

        // 상품들 - 선반 위에 배치
        const productColors = [0xFF0000, 0x0000FF, 0x00FF00, 0xFFFF00, 0xFFA500, 0x800080];
        
        function createProduct(x, y, z, color) {
            const boxGeometry = new THREE.BoxGeometry(0.25, 0.35, 0.25);
            const boxMaterial = new THREE.MeshStandardMaterial({ 
                color: color
            });
            const box = new THREE.Mesh(boxGeometry, boxMaterial);
            box.position.set(x, y, z);
            box.castShadow = true;
            return box;
        }

        // 오른쪽 선반에 상품 배치
        const rightShelfPositions = [
            { x: 10, z: -10 },
            { x: 10, z: -5 },
            { x: 10, z: 0 },
            { x: 10, z: 5 },
            { x: 10, z: 10 }
        ];

        rightShelfPositions.forEach(pos => {
            for (let i = 0; i < 3; i++) { // 3층
                for (let j = 0; j < 4; j++) { // 층당 4개
                    const offsetX = (j - 1.5) * 0.4;
                    const offsetY = 0.55 + i * 0.7;
                    const color = productColors[Math.floor(Math.random() * productColors.length)];
                    scene.add(createProduct(pos.x + offsetX, offsetY, pos.z, color));
                }
            }
        });

        // 뒷쪽 선반에 상품 배치
        const backShelfPositions = [
            { x: -5, z: 15 },
            { x: 0, z: 15 },
            { x: 5, z: 15 }
        ];

        backShelfPositions.forEach(pos => {
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 4; j++) {
                    const offsetX = (j - 1.5) * 0.4;
                    const offsetY = 0.55 + i * 0.7;
                    const color = productColors[Math.floor(Math.random() * productColors.length)];
                    scene.add(createProduct(pos.x + offsetX, offsetY, pos.z, color));
                }
            }
        });

        // 야채/과일 코너에 과일들
        function createFruit(x, y, z, type) {
            let geometry;
            let color;
            
            switch(type) {
                case 'apple':
                    geometry = new THREE.SphereGeometry(0.15, 16, 16);
                    color = 0xFF0000;
                    break;
                case 'orange':
                    geometry = new THREE.SphereGeometry(0.15, 16, 16);
                    color = 0xFFA500;
                    break;
                case 'banana':
                    geometry = new THREE.CylinderGeometry(0.08, 0.08, 0.4, 8);
                    color = 0xFFFF00;
                    break;
                default:
                    geometry = new THREE.SphereGeometry(0.15, 16, 16);
                    color = 0x00FF00;
            }
            
            const material = new THREE.MeshStandardMaterial({ color: color });
            const fruit = new THREE.Mesh(geometry, material);
            fruit.position.set(x, y, z);
            fruit.castShadow = true;
            return fruit;
        }

        // 야채/과일 진열대에 과일 배치
        for (let i = 0; i < 8; i++) {
            const fruitTypes = ['apple', 'orange', 'banana'];
            const type = fruitTypes[Math.floor(Math.random() * fruitTypes.length)];
            const x = 15 + (Math.random() - 0.5) * 2;
            const z = (Math.random() - 0.5) * 1.5;
            scene.add(createFruit(x, 0.9, z, type));
        }

        // 아바타 (간단한 사람 형태)
        function createAvatar() {
            const avatarGroup = new THREE.Group();
            
            // 몸통
            const bodyGeometry = new THREE.CylinderGeometry(0.3, 0.35, 0.8, 8);
            const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x4169E1 });
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            body.position.y = 0.9;
            body.castShadow = true;
            avatarGroup.add(body);
            
            // 머리
            const headGeometry = new THREE.SphereGeometry(0.25, 16, 16);
            const headMaterial = new THREE.MeshStandardMaterial({ color: 0xFFDBB4 });
            const head = new THREE.Mesh(headGeometry, headMaterial);
            head.position.y = 1.6;
            head.castShadow = true;
            avatarGroup.add(head);
            
            // 다리
            const legGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.5, 8);
            const legMaterial = new THREE.MeshStandardMaterial({ color: 0x2F4F4F });
            
            const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
            leftLeg.position.set(-0.15, 0.25, 0);
            leftLeg.castShadow = true;
            avatarGroup.add(leftLeg);
            
            const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
            rightLeg.position.set(0.15, 0.25, 0);
            rightLeg.castShadow = true;
            avatarGroup.add(rightLeg);
            
            // 팔
            const armGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.5, 8);
            const armMaterial = new THREE.MeshStandardMaterial({ color: 0x4169E1 });
            
            const leftArm = new THREE.Mesh(armGeometry, armMaterial);
            leftArm.position.set(-0.45, 1, 0);
            leftArm.rotation.z = 0.3;
            leftArm.castShadow = true;
            avatarGroup.add(leftArm);
            
            const rightArm = new THREE.Mesh(armGeometry, armMaterial);
            rightArm.position.set(0.45, 1, 0);
            rightArm.rotation.z = -0.3;
            rightArm.castShadow = true;
            avatarGroup.add(rightArm);
            
            return avatarGroup;
        }

        const avatar = createAvatar();
        avatar.position.set(0, 0, 10);
        scene.add(avatar);

        // 카메라 설정
        camera.position.copy(avatar.position);
        camera.position.y += 2;

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
            camera.position.y += 2;
            
            renderer.render(scene, camera);
        }

        animate();
        console.log('3D app initialized successfully');

    } catch (error) {
        console.error('3D app initialization error:', error);
        showError('3D 앱 초기화 오류: ' + error.message);
    }
}

// 업로드 UI 초기화
function initUploadUI() {
    const uploadBtn = document.getElementById('upload-btn');
    const uploadPopup = document.getElementById('upload-popup');
    const fileInput = document.getElementById('file-input');
    const confirmBtn = document.getElementById('confirm-upload');
    const cancelBtn = document.getElementById('cancel-upload');
    const uploadStatus = document.getElementById('upload-status');

    // 업로드 버튼 클릭
    uploadBtn.addEventListener('click', () => {
        uploadPopup.classList.remove('hidden');
        uploadStatus.textContent = '';
        uploadStatus.className = '';
    });

    // 취소 버튼 클릭
    cancelBtn.addEventListener('click', () => {
        uploadPopup.classList.add('hidden');
        fileInput.value = '';
    });

    // 확인 버튼 클릭
    confirmBtn.addEventListener('click', async () => {
        const file = fileInput.files[0];
        if (!file) {
            uploadStatus.textContent = '파일을 선택해주세요';
            uploadStatus.className = 'error';
            return;
        }

        uploadStatus.textContent = '업로드 중...';
        uploadStatus.className = '';

        try {
            const result = await firebaseManager.uploadFile(file, `uploaded/${Date.now()}_${file.name}`);
            
            if (result.success) {
                uploadStatus.textContent = '업로드 성공!';
                uploadStatus.className = 'success';
                
                // 3D 마트에 이미지 추가
                addImageToScene(result.url);
                
                setTimeout(() => {
                    uploadPopup.classList.add('hidden');
                    fileInput.value = '';
                }, 1500);
            } else {
                uploadStatus.textContent = '업로드 실패: ' + result.error;
                uploadStatus.className = 'error';
            }
        } catch (error) {
            uploadStatus.textContent = '업로드 오류: ' + error.message;
            uploadStatus.className = 'error';
        }
    });
}

// 이미지를 3D 장면에 추가
function addImageToScene(imageUrl) {
    if (!window.scene) return;
    
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(imageUrl, (texture) => {
        // 이미지 프레임
        const frameGeometry = new THREE.BoxGeometry(2, 1.5, 0.1);
        const frameMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        
        // 이미지 텍스처
        const imageGeometry = new THREE.PlaneGeometry(1.8, 1.3);
        const imageMaterial = new THREE.MeshBasicMaterial({ 
            map: texture,
            side: THREE.DoubleSide
        });
        const image = new THREE.Mesh(imageGeometry, imageMaterial);
        image.position.z = 0.06;
        
        frame.add(image);
        
        // 랜덤 위치에 배치
        frame.position.set(
            (Math.random() - 0.5) * 20,
            2 + Math.random() * 2,
            (Math.random() - 0.5) * 20
        );
        
        frame.castShadow = true;
        window.scene.add(frame);
        
        console.log('Image added to scene:', imageUrl);
    });
}