/* Matthew Meyer
 * CSCI 3820 Final Project
 */

level = [
    [9, 9, 9, 9, 9, 9, 9, 9, 9, 9],
    [9, 1, 1, 1, 1, 1, 1, 1, 1, 9],
    [9, 1, 1, 1, 1, 1, 1, 1, 1, 9],
    [9, 1, 1, 1, 1, 1, 1, 1, 1, 9],
    [9, 1, 1, 1, 1, 1, 1, 1, 1, 9],
    [9, 1, 1, 1, 1, 1, 1, 1, 1, 9],
    [9, 1, 1, 1, 1, 1, 1, 1, 1, 9],
    [9, 1, 1, 1, 1, 1, 1, 1, 1, 9],
    [9, 1, 1, 1, 1, 1, 1, 1, 1, 9],
    [9, 9, 9, 9, 9, 9, 9, 9, 9, 9]
];

var WIDTH = window.innerWidth,
    HEIGHT = window.innerHeight,
    ASPECT = WIDTH / HEIGHT;

var PLAYER_HEIGHT = 10,
    PLAYER_WIDTH = 1;
    PLAYER_WALK_SPEED = 300,
    PLAYER_JUMP_SPEED = 250,
    PLAYER_TERMINAL_VELOCITY = 1000;

var scene, cam, renderer, player, objects = [], stats;
var raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0), 0, 10);

var blocker = document.getElementById('blocker');
var instructions = document.getElementById('instructions');
// main()
init();
render();

// Sets up scene, renderer, camera, and UI
function init() {
    scene = new THREE.Scene();
    scene.add(new THREE.AmbientLight(0xffffff));

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(WIDTH, HEIGHT);
    document.body.appendChild(renderer.domElement);

    cam = new THREE.PerspectiveCamera(70, ASPECT, 0.1, 1000);
    player = new THREE.Player(cam);
    player.walkSpeed = PLAYER_WALK_SPEED;
    player.jumpSpeed = PLAYER_JUMP_SPEED;
    player.width = PLAYER_WIDTH;
    player.height = PLAYER_HEIGHT;
    player.terminalVelocity = PLAYER_TERMINAL_VELOCITY;

    scene.add(player.getObject());

    loadAssets();
    initPointerLock();
    getStats();

    player.addEnvironment(objects);
}

function loadAssets() {
    var geo = new THREE.CubeGeometry(PLAYER_HEIGHT, PLAYER_HEIGHT, PLAYER_HEIGHT);
    var mat = new THREE.MeshBasicMaterial({color: 0x000000});
    var mesh = new THREE.Mesh(geo, mat);
    for (var l = 0; l < 10; l++) {
        for (var i = 0; i < 10; i++) {
            for (var j = 0; j < 10; j++) {
                if (level[i][j] > 0) {
                    level[i][j]--;

                    var m = mesh.clone();
                    m.material = mesh.material.clone();
                    m.material.color.set(randomColor());
                    m.position.x = i * 10 - 50;
                    m.position.y = l * 10 + PLAYER_HEIGHT;
                    m.position.z = j * 10 - 50;
                    objects.push(m);
                    scene.add(m)
                }
            }
        }
    }

}

function initPointerLock() {
    var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;
    if (havePointerLock) {
        var element = document.body;
        var pointerlockchange = function () {
            if (document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element) {
                player.enabled = true;
                blocker.style.display = 'none';
            } else {
                player.enabled = false;
                blocker.style.display = '-webkit-box';
                blocker.style.display = '-moz-box';
                blocker.style.display = 'box';
                instructions.style.display = '';
            }
        };
        var pointerlockerror = function () {
            instructions.style.display = '';
        };
        // Hook pointer lock state change events
        document.addEventListener('pointerlockchange', pointerlockchange, false);
        document.addEventListener('mozpointerlockchange', pointerlockchange, false);
        document.addEventListener('webkitpointerlockchange', pointerlockchange, false);
        document.addEventListener('pointerlockerror', pointerlockerror, false);
        document.addEventListener('mozpointerlockerror', pointerlockerror, false);
        document.addEventListener('webkitpointerlockerror', pointerlockerror, false);
        instructions.addEventListener('click', function () {
            instructions.style.display = 'none';
            // Ask the browser to lock the pointer
            element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
            if (/Firefox/i.test(navigator.userAgent)) {
                var fullscreenchange = function () {
                    if (document.fullscreenElement === element || document.mozFullscreenElement === element || document.mozFullScreenElement === element) {
                        document.removeEventListener('fullscreenchange', fullscreenchange);
                        document.removeEventListener('mozfullscreenchange', fullscreenchange);
                        element.requestPointerLock();
                    }
                };
                document.addEventListener('fullscreenchange', fullscreenchange, false);
                document.addEventListener('mozfullscreenchange', fullscreenchange, false);
                element.requestFullscreen = element.requestFullscreen || element.mozRequestFullscreen || element.mozRequestFullScreen || element.webkitRequestFullscreen;
                element.requestFullscreen();
            } else {
                element.requestPointerLock();
            }
        }, false);
    } else {
        instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';
    }
}

function render() {
    stats.begin();

    raycaster.ray.origin.copy(player.getObject().position);
    var intersections = raycaster.intersectObjects(objects);
    player.isOnObject(intersections.length > 0);

    player.update();

    if (player.isDead()) {
        player.restart();
        console.log('dead at ', player.getObject().position);
    }

    renderer.render(scene, cam);

    stats.end();
    requestAnimationFrame(render);

}

window.addEventListener('resize', function () {
    WIDTH = window.innerWidth;
    HEIGHT = window.innerHeight;
    ASPECT = WIDTH / HEIGHT;
    if (cam) {
        cam.aspect = ASPECT;
        cam.updateProjectionMatrix();
    }
    if (renderer) {
        renderer.setSize(WIDTH, HEIGHT);
    }
});

function randomColor() {
    return Math.floor(Math.random() * 16777215);
}

function getStats() {
    stats = new Stats();
    stats.setMode(0); // 0: fps, 1: ms, 2: mb

// align top-left
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '0px';
    stats.domElement.style.top = '0px';

    document.body.appendChild(stats.domElement);
}