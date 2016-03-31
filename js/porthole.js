/* Matthew Meyer
 * CSCI 3820 Final Project
 */

var WIDTH = window.innerWidth,
    HEIGHT = window.innerHeight,
    ASPECT = WIDTH / HEIGHT;

var scene, cam, renderer, player;


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
    player = new THREE.PointerLockControls(cam);
    player.enabled = true;

    scene.add(player.getObject());

    loadAssets();
    initPointerLock();
}

function loadAssets() {
    var geo = new THREE.CubeGeometry(7, 7, 7);
    var mat = new THREE.MeshBasicMaterial({color: 0xff0000});
    var mesh = new THREE.Mesh(geo, mat);
    for (var i = -100; i <= 100; i += 10) {
        for (var j = -100; j <= 100; j += 10) {
            var m = mesh.clone();
            m.material = mesh.material.clone();
            m.material.color.set(randomColor());
            m.position.x = i;
            m.position.y = 0;
            m.position.z = j;
            scene.add(m)
        }
    }

}

function initPointerLock() {
    var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;
    if (havePointerLock) {
        var element = document.body;
        var pointerlockchange = function (event) {
            if (document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element) {
                controlsEnabled = true;
                controls.enabled = true;
                blocker.style.display = 'none';
            } else {
                controls.enabled = false;
                blocker.style.display = '-webkit-box';
                blocker.style.display = '-moz-box';
                blocker.style.display = 'box';
                instructions.style.display = '';
            }
        };
        var pointerlockerror = function (event) {
            instructions.style.display = '';
        };
        // Hook pointer lock state change events
        document.addEventListener('pointerlockchange', pointerlockchange, false);
        document.addEventListener('mozpointerlockchange', pointerlockchange, false);
        document.addEventListener('webkitpointerlockchange', pointerlockchange, false);
        document.addEventListener('pointerlockerror', pointerlockerror, false);
        document.addEventListener('mozpointerlockerror', pointerlockerror, false);
        document.addEventListener('webkitpointerlockerror', pointerlockerror, false);
        instructions.addEventListener('click', function (event) {
            instructions.style.display = 'none';
            // Ask the browser to lock the pointer
            element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
            if (/Firefox/i.test(navigator.userAgent)) {
                var fullscreenchange = function (event) {
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
    requestAnimationFrame(render);
    renderer.render(scene, cam);
    player.update();
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

