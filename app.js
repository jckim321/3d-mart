const THREE = window.THREE;

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyCYQWb8dEno__POur0UABfi0F9JR4i_XQw",
  authDomain: "dive-travel-9dcf7.firebaseapp.com",
  projectId: "dive-travel-9dcf7",
  storageBucket: "dive-travel-9dcf7.firebasestorage.app",
  messagingSenderId: "996020953462",
  appId: "1:996020953462:web:81c9bf7db384321c335a57",
  measurementId: "G-W724QN8LBY"
};

// Initialize Firebase
try {
  firebase.initializeApp(firebaseConfig);
  const analytics = firebase.analytics();
  const storage = firebase.storage();
  console.log('Firebase initialized successfully');
  
  // Firebase Storage 예시 함수
  async function uploadToFirebase(file, fileName) {
    try {
      const storageRef = storage.ref(`assets/${fileName}`);
      await storageRef.put(file);
      const url = await storageRef.getDownloadURL();
      console.log('File uploaded to Firebase Storage:', url);
      return url;
    } catch (error) {
      console.error('Firebase Storage upload error:', error);
      throw error;
    }
  }
  
  // 전역 함수로 등록
  window.uploadToFirebase = uploadToFirebase;
  
} catch (error) {
  console.error('Firebase initialization error:', error);
}

// Scene, Camera, Renderer 설정
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xFFFFFF); // 실내 느낌의 흰색 배경

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 2, 5);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.getElementById('container').appendChild(renderer.domElement);

// 조명 설정 (편의점 스타일 밝은 조명)
const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(10, 25, 10);
directionalLight.castShadow = true;
scene.add(directionalLight);

// 천장에 밝은 형광등(LED 백색광) 격자 패턴 추가
function createCeilingLight(x, z) {
    const lightGeometry = new THREE.BoxGeometry(2, 0.1, 0.5);
    const lightMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xFFFFFF,
        emissive: 0xFFFFFF,
        emissiveIntensity: 0.8
    });
    const light = new THREE.Mesh(lightGeometry, lightMaterial);
    light.position.set(x, 7.9, z);
    
    // 실제 조명 추가
    const pointLight = new THREE.PointLight(0xFFFFFF, 0.5, 10);
    pointLight.position.set(x, 7.5, z);
    scene.add(pointLight);
    
    return light;
}

// 천장에 형광등 격자 배치
for (let x = -18; x <= 18; x += 6) {
    for (let z = -18; z <= 18; z += 6) {
        scene.add(createCeilingLight(x, z));
    }
}

// 바닥 생성 (빛을 반사하는 밝은 회색 타일)
const floorSize = 50;
const floorGeometry = new THREE.PlaneGeometry(floorSize, floorSize);

// 타일 패턴 생성을 위한 캔버스 텍스처
const canvas = document.createElement('canvas');
canvas.width = 512;
canvas.height = 512;
const ctx = canvas.getContext('2d');

// 밝은 회색 배경
ctx.fillStyle = '#D3D3D3';
ctx.fillRect(0, 0, 512, 512);

// 타일 격자무늬
ctx.strokeStyle = '#C0C0C0';
ctx.lineWidth = 2;
const tileSize = 64;

for (let i = 0; i <= 512; i += tileSize) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, 512);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(512, i);
    ctx.stroke();
}

const floorTexture = new THREE.CanvasTexture(canvas);
floorTexture.wrapS = THREE.RepeatWrapping;
floorTexture.wrapT = THREE.RepeatWrapping;
floorTexture.repeat.set(8, 8);

const floorMaterial = new THREE.MeshStandardMaterial({ 
    map: floorTexture,
    roughness: 0.2,    // 더 매끄러운 표면
    metalness: 0.3      // 빛 반사 증가
});
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

// 벽 생성 함수
function createWall(width, height, x, y, z, rotationY = 0) {
    const wallGeometry = new THREE.BoxGeometry(width, height, 0.3);
    const wallMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xF5F5F5,
        roughness: 0.8
    });
    const wall = new THREE.Mesh(wallGeometry, wallMaterial);
    wall.position.set(x, y, z);
    wall.rotation.y = rotationY;
    wall.castShadow = true;
    wall.receiveShadow = true;
    return wall;
}

// 마트 벽들 (사방)
const wallHeight = 8;
const martSize = 25;

// 앞쪽 벽 (입구 반대편)
scene.add(createWall(martSize * 2, wallHeight, 0, wallHeight / 2, -martSize));

// 뒤쪽 벽 (입구 쪽 - 입구 공간 남김)
scene.add(createWall(martSize * 2, wallHeight, 0, wallHeight / 2, martSize));

// 왼쪽 벽
scene.add(createWall(martSize * 2, wallHeight, -martSize, wallHeight / 2, 0, Math.PI / 2));

// 오른쪽 벽
scene.add(createWall(martSize * 2, wallHeight, martSize, wallHeight / 2, 0, Math.PI / 2));

// 천장 생성
const ceilingGeometry = new THREE.PlaneGeometry(martSize * 2, martSize * 2);
const ceilingMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xFAFAFA,
    roughness: 0.9,
    side: THREE.DoubleSide
});
const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
ceiling.rotation.x = Math.PI / 2;
ceiling.position.y = wallHeight;
ceiling.receiveShadow = true;
scene.add(ceiling);

// 상품 색상 배열
const productColors = [
    0xFF0000, // 빨간색
    0x0000FF, // 파란색
    0x00FF00, // 초록색
    0xFFFF00, // 노란색
    0xFF00FF, // 마젠타
    0x00FFFF, // 시안
    0xFFA500, // 주황색
    0x800080, // 보라색
    0xFFC0CB, // 분홍색
    0x8B4513  // 갈색
];

// 상품 아이템들을 저장할 배열
const productItems = [];

// 곤돌라 선반 생성 (양면 진열 낮은 선반)
function createGondolaShelf(x, z, rotation = 0) {
    const gondolaGroup = new THREE.Group();
    
    // 선반 프레임 (강철)
    const frameGeometry = new THREE.BoxGeometry(4, 1.2, 1.5);
    const frameMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x708090, // 강철 회색
        metalness: 0.8,
        roughness: 0.2
    });
    const frame = new THREE.Mesh(frameGeometry, frameMaterial);
    frame.position.y = 0.6;
    frame.castShadow = true;
    frame.receiveShadow = true;
    gondolaGroup.add(frame);
    
    // 양면 선반 레벨들
    for (let side = -1; side <= 1; side += 2) {
        for (let i = 0; i < 2; i++) {
            const shelfGeometry = new THREE.BoxGeometry(3.8, 0.08, 0.6);
            const shelfMaterial = new THREE.MeshStandardMaterial({ 
                color: 0xD3D3D3,
                metalness: 0.5,
                roughness: 0.3
            });
            const shelf = new THREE.Mesh(shelfGeometry, shelfMaterial);
            shelf.position.set(0, 0.25 + i * 0.4, side * 0.3);
            shelf.receiveShadow = true;
            gondolaGroup.add(shelf);
            
            // 상품들
            for (let j = 0; j < 5; j++) {
                const productGeometry = new THREE.BoxGeometry(0.5, 0.6, 0.4);
                const randomColor = productColors[Math.floor(Math.random() * productColors.length)];
                const productMaterial = new THREE.MeshStandardMaterial({ 
                    color: randomColor
                });
                const product = new THREE.Mesh(productGeometry, productMaterial);
                product.position.set(-1.5 + j * 0.7, 0.55 + i * 0.4, side * 0.3);
                product.castShadow = true;
                
                productItems.push(product);
                gondolaGroup.add(product);
            }
        }
    }
    
    gondolaGroup.position.set(x, 0, z);
    gondolaGroup.rotation.y = rotation;
    return gondolaGroup;
}

// 마트 선반들 생성
function createShelf(x, z, rotation = 0) {
    const shelfGroup = new THREE.Group();
    
    // 선반 몸체
    const shelfGeometry = new THREE.BoxGeometry(3, 2, 0.8);
    const shelfMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
    const shelf = new THREE.Mesh(shelfGeometry, shelfMaterial);
    shelf.position.y = 1;
    shelf.castShadow = true;
    shelf.receiveShadow = true;
    shelfGroup.add(shelf);
    
    // 선반 레벨들
    for (let i = 0; i < 3; i++) {
        const levelGeometry = new THREE.BoxGeometry(2.8, 0.1, 0.7);
        const levelMaterial = new THREE.MeshStandardMaterial({ color: 0xDEB887 });
        const level = new THREE.Mesh(levelGeometry, levelMaterial);
        level.position.y = 0.3 + i * 0.6;
        level.receiveShadow = true;
        shelfGroup.add(level);
        
        // 상품들 (다양한 색상의 박스들)
        for (let j = 0; j < 4; j++) {
            const productGeometry = new THREE.BoxGeometry(0.4, 0.5, 0.4);
            const randomColor = productColors[Math.floor(Math.random() * productColors.length)];
            const productMaterial = new THREE.MeshStandardMaterial({ 
                color: randomColor
            });
            const product = new THREE.Mesh(productGeometry, productMaterial);
            product.position.set(-1 + j * 0.6, 0.55 + i * 0.6, 0);
            product.castShadow = true;
            
            // 상품 아이템으로 저장
            productItems.push(product);
            
            shelfGroup.add(product);
        }
    }
    
    shelfGroup.position.set(x, 0, z);
    shelfGroup.rotation.y = rotation;
    return shelfGroup;
}

// 마트 공간에 선반 배치 (실내 공간에 맞게 조정)
// 왼쪽 벽면 선반들
scene.add(createShelf(-18, -10, 0));
scene.add(createShelf(-18, -5, 0));
scene.add(createShelf(-18, 0, 0));
scene.add(createShelf(-18, 5, 0));
scene.add(createShelf(-18, 10, 0));

// 오른쪽 벽면 선반들
scene.add(createShelf(18, -10, 0));
scene.add(createShelf(18, -5, 0));
scene.add(createShelf(18, 0, 0));
scene.add(createShelf(18, 5, 0));
scene.add(createShelf(18, 10, 0));

// 위쪽 벽면 선반들
scene.add(createShelf(-10, -18, Math.PI / 2));
scene.add(createShelf(0, -18, Math.PI / 2));
scene.add(createShelf(10, -18, Math.PI / 2));

// 아래쪽 벽면 선반들
scene.add(createShelf(-10, 18, Math.PI / 2));
scene.add(createShelf(0, 18, Math.PI / 2));
scene.add(createShelf(10, 18, Math.PI / 2));

// 중앙 섬형 선반들
scene.add(createShelf(-6, -6, 0));
scene.add(createShelf(6, -6, 0));
scene.add(createShelf(-6, 6, 0));
scene.add(createShelf(6, 6, 0));

// 중앙에 곤돌라 선반 3열 배치 (양면 진열)
scene.add(createGondolaShelf(0, -8, 0));
scene.add(createGondolaShelf(0, 0, 0));
scene.add(createGondolaShelf(0, 8, 0));

// 계산대 생성 (입구 쪽으로 이동)
const counterGroup = new THREE.Group();

// 계산대 본체
const counterGeometry = new THREE.BoxGeometry(8, 1.2, 3);
const counterMaterial = new THREE.MeshStandardMaterial({ color: 0x2F4F4F });
const counter = new THREE.Mesh(counterGeometry, counterMaterial);
counter.position.y = 0.6;
counter.castShadow = true;
counter.receiveShadow = true;
counterGroup.add(counter);

// 계산대 상판
const counterTopGeometry = new THREE.BoxGeometry(8.2, 0.1, 3.2);
const counterTopMaterial = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
const counterTop = new THREE.Mesh(counterTopGeometry, counterTopMaterial);
counterTop.position.y = 1.25;
counterTop.castShadow = true;
counterGroup.add(counterTop);

// 계산기 모양
const calculatorGeometry = new THREE.BoxGeometry(0.6, 0.15, 0.4);
const calculatorMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
const calculator = new THREE.Mesh(calculatorGeometry, calculatorMaterial);
calculator.position.set(0, 1.35, 0);
calculator.castShadow = true;
counterGroup.add(calculator);

// 레지스터 화면
const screenGeometry = new THREE.BoxGeometry(0.8, 0.6, 0.1);
const screenMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00, emissive: 0x00ff00, emissiveIntensity: 0.3 });
const screen = new THREE.Mesh(screenGeometry, screenMaterial);
screen.position.set(1.5, 1.4, 0);
screen.castShadow = true;
counterGroup.add(screen);

counterGroup.position.set(0, 0, 15); // 입구 쪽(앞쪽)으로 이동
scene.add(counterGroup);

// 대형 냉장고(유리문) 생성 - 안쪽 벽
function createCooler(x, z, width) {
    const coolerGroup = new THREE.Group();
    
    // 냉장고 본체
    const bodyGeometry = new THREE.BoxGeometry(width, 3, 1);
    const bodyMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xE0E0E0,
        metalness: 0.3,
        roughness: 0.4
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 1.5;
    body.castShadow = true;
    body.receiveShadow = true;
    coolerGroup.add(body);
    
    // 유리문
    const doorGeometry = new THREE.BoxGeometry(width - 0.2, 2.5, 0.1);
    const doorMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x87CEEB,
        transparent: true,
        opacity: 0.3,
        metalness: 0.9,
        roughness: 0.1
    });
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.set(0, 1.4, 0.5);
    door.castShadow = true;
    coolerGroup.add(door);
    
    // 냉장고 내부 조명
    const internalLight = new THREE.PointLight(0xFFFFFF, 0.3, 3);
    internalLight.position.set(0, 1.5, 0.3);
    coolerGroup.add(internalLight);
    
    // 음료수 상품들
    for (let i = 0; i < Math.floor(width / 0.8); i++) {
        const canGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.5, 16);
        const canMaterial = new THREE.MeshStandardMaterial({ 
            color: new THREE.Color().setHSL(Math.random(), 0.7, 0.5)
        });
        const can = new THREE.Mesh(canGeometry, canMaterial);
        can.position.set(-width/2 + 0.4 + i * 0.8, 0.8, 0.2);
        can.castShadow = true;
        
        productItems.push(can);
        coolerGroup.add(can);
    }
    
    coolerGroup.position.set(x, 0, z);
    return coolerGroup;
}

// 안쪽 벽에 대형 냉장고 배치
scene.add(createCooler(-10, -24, 8));
scene.add(createCooler(0, -24, 8));
scene.add(createCooler(10, -24, 8));

// 아바타 생성 (그룹으로 구성)
const avatarGroup = new THREE.Group();

// 아바타 본체 (구체)
const avatarGeometry = new THREE.SphereGeometry(0.5, 32, 32);
const avatarMaterial = new THREE.MeshStandardMaterial({ color: 0x4169E1 });
const avatarBody = new THREE.Mesh(avatarGeometry, avatarMaterial);
avatarBody.position.y = 0;
avatarBody.castShadow = true;
avatarGroup.add(avatarBody);

// 코 (작은 원뿔 형태로 방향 표시)
const noseGeometry = new THREE.ConeGeometry(0.15, 0.3, 8);
const noseMaterial = new THREE.MeshStandardMaterial({ color: 0xFFD700 });
const nose = new THREE.Mesh(noseGeometry, noseMaterial);
nose.position.set(0, 0.1, 0.5); // 앞쪽에 배치
nose.rotation.x = Math.PI / 2; // 앞을 향하도록 회전
nose.castShadow = true;
avatarGroup.add(nose);

// 눈 (왼쪽)
const leftEyeGeometry = new THREE.SphereGeometry(0.08, 16, 16);
const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });
const leftEye = new THREE.Mesh(leftEyeGeometry, eyeMaterial);
leftEye.position.set(-0.15, 0.15, 0.4);
leftEye.castShadow = true;
avatarGroup.add(leftEye);

// 눈 (오른쪽)
const rightEye = new THREE.Mesh(leftEyeGeometry, eyeMaterial);
rightEye.position.set(0.15, 0.15, 0.4);
rightEye.castShadow = true;
avatarGroup.add(rightEye);

// 눈동자 (왼쪽)
const pupilGeometry = new THREE.SphereGeometry(0.04, 16, 16);
const pupilMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
const leftPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
leftPupil.position.set(-0.15, 0.15, 0.45);
avatarGroup.add(leftPupil);

// 눈동자 (오른쪽)
const rightPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
rightPupil.position.set(0.15, 0.15, 0.45);
avatarGroup.add(rightPupil);

avatarGroup.position.set(0, 1, -15); // 입구 반대편에서 시작
scene.add(avatarGroup);

// 카메라를 아바타 위에 배치
camera.position.copy(avatarGroup.position);
camera.position.y += 1.5;

// 키보드 컨트롤
const keys = {
    forward: false,
    backward: false,
    left: false,
    right: false
};

const speed = 0.15;
const rotationSpeed = 0.03;
const interactionDistance = 2.0; // 상품과의 상호작용 거리
const cameraDistance = 4.0; // 3인칭 카메라 거리
const cameraHeight = 2.0; // 카메라 높이

document.addEventListener('keydown', (event) => {
    switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
            keys.forward = true;
            break;
        case 'KeyS':
        case 'ArrowDown':
            keys.backward = true;
            break;
        case 'KeyA':
        case 'ArrowLeft':
            keys.left = true;
            break;
        case 'KeyD':
        case 'ArrowRight':
            keys.right = true;
            break;
    }
});

document.addEventListener('keyup', (event) => {
    switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
            keys.forward = false;
            break;
        case 'KeyS':
        case 'ArrowDown':
            keys.backward = false;
            break;
        case 'KeyA':
        case 'ArrowLeft':
            keys.left = false;
            break;
        case 'KeyD':
        case 'ArrowRight':
            keys.right = false;
            break;
    }
});

// 마우스로 시점 회전
let isPointerLocked = false;
let mouseX = 0;
let mouseY = 0;

document.addEventListener('click', () => {
    document.body.requestPointerLock();
});

document.addEventListener('pointerlockchange', () => {
    isPointerLocked = document.pointerLockElement === document.body;
});

document.addEventListener('mousemove', (event) => {
    if (isPointerLocked) {
        mouseX -= event.movementX * rotationSpeed;
        mouseY -= event.movementY * rotationSpeed;
        mouseY = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, mouseY));
    }
});

// 창 크기 조절
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// 팝업 요소
const popup = document.getElementById('item-popup');

// 애니메이션 루프
function animate() {
    requestAnimationFrame(animate);
    
    // 아바타 이동
    const direction = new THREE.Vector3();
    
    if (keys.forward) {
        direction.z -= 1;
    }
    if (keys.backward) {
        direction.z += 1;
    }
    if (keys.left) {
        direction.x -= 1;
    }
    if (keys.right) {
        direction.x += 1;
    }
    
    direction.normalize();
    
    if (direction.length() > 0) {
        const moveVector = direction.clone();
        moveVector.applyAxisAngle(new THREE.Vector3(0, 1, 0), mouseX);
        
        avatarGroup.position.x += moveVector.x * speed;
        avatarGroup.position.z += moveVector.z * speed;
        
        // 아바타가 움직이는 방향으로 회전
        const targetRotation = Math.atan2(moveVector.x, moveVector.z);
        avatarGroup.rotation.y = targetRotation;
        
        // 마트 경계 제한 (실내 공간에 맞춰 조정)
        avatarGroup.position.x = Math.max(-22, Math.min(22, avatarGroup.position.x));
        avatarGroup.position.z = Math.max(-24, Math.min(22, avatarGroup.position.z));
    }
    
    // 상품과의 거리 확인 및 팝업 표시
    let nearestProduct = null;
    let nearestDistance = Infinity;
    
    productItems.forEach(product => {
        // 상품의 월드 좌표 계산
        const productWorldPosition = new THREE.Vector3();
        product.getWorldPosition(productWorldPosition);
        
        // 아바타와 상품 간의 거리 계산
        const distance = avatarGroup.position.distanceTo(productWorldPosition);
        
        if (distance < nearestDistance) {
            nearestDistance = distance;
            nearestProduct = product;
        }
    });
    
    // 가장 가까운 상품이 상호작용 거리 이내이면 팝업 표시
    if (nearestDistance < interactionDistance && nearestProduct) {
        popup.classList.remove('hidden');
    } else {
        popup.classList.add('hidden');
    }
    
    // 카메라 업데이트 (3인칭 백뷰)
    // 기본 카메라 오프셋 (아바타 뒤쪽)
    const cameraOffset = new THREE.Vector3(0, cameraHeight, -cameraDistance);
    
    // 마우스 수평 회전만 적용 (아바타 주변 회전)
    cameraOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), mouseX);
    
    // 카메라 위치 설정
    camera.position.copy(avatarGroup.position);
    camera.position.add(cameraOffset);
    
    // 카메라가 항상 아바타를 바라보도록 설정
    const lookAtTarget = avatarGroup.position.clone();
    lookAtTarget.y += 0.5 + mouseY; // 수직 시점 조절
    camera.lookAt(lookAtTarget);
    
    renderer.render(scene, camera);
}

animate();