/**
 * Adapted from PointerLockControls.js by mrdoob / http://mrdoob.com/
 */

var shotsFired = false;

THREE.Player = function (camera) {

    var scope = this;

    var environment = [];

    var height = 10;
    var width = 1;
    var walkSpeed = 400;
    var jumpSpeed = 200;
    var terminalVelocity = 1000;

    var leftPortHole = new THREE.PortHole(scene, 0x0000ff);
    var rightPortHole = new THREE.PortHole(scene, 0xee8844);
    leftPortHole.setViewer(rightPortHole.getViewer());
    rightPortHole.setViewer(leftPortHole.getViewer());
    leftPortHole.getObject().name = 'left';
    rightPortHole.getObject().name = 'right';

    var portalEntered = new THREE.Clock(true);
    var prevPortalTime = portalEntered.getElapsedTime();

    var crossHair = new THREE.Mesh(
        new THREE.RingGeometry(0.01, 0.02),
        new THREE.MeshPhongMaterial({color: 0x333333, transparent: true, opacity: 0.5})
    );
    crossHair.position.z -= width / 2;

    camera.rotation.set(0, 0, 0);
    camera.add(crossHair);

    var pitchObject = new THREE.Object3D();
    pitchObject.add(camera);

    var yawObject = new THREE.Object3D();
    yawObject.position.y = height;
    yawObject.add(pitchObject);


    var temp = new THREE.Mesh(new THREE.SphereGeometry(1), new THREE.MeshBasicMaterial({color: 0xffffff}));
    yawObject.add(temp);

    var moveForward = false;
    var moveBackward = false;
    var moveLeft = false;
    var moveRight = false;

    var isOnObject = false;
    var canJump = false;
    var dead = false;

    var prevTime = performance.now();
    var velocity = new THREE.Vector3();
    var PI_2 = Math.PI / 2;
    var raycaster = new THREE.Raycaster();

    var onMouseMove = function (event) {

        if (scope.enabled === false) return;

        var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
        var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

        yawObject.rotation.y -= movementX * 0.002;
        pitchObject.rotation.x -= movementY * 0.002;

        pitchObject.rotation.x = Math.max(-PI_2, Math.min(PI_2, pitchObject.rotation.x));

    };

    var onKeyDown = function (event) {

        switch (event.keyCode) {

            case 38: // up
            case 87: // w
                moveForward = true;
                break;

            case 37: // left
            case 65: // a
                moveLeft = true;
                break;

            case 40: // down
            case 83: // s
                moveBackward = true;
                break;

            case 39: // right
            case 68: // d
                moveRight = true;
                break;

            case 32: // space
                if (canJump === true) velocity.y += jumpSpeed;
                canJump = false;
                break;

        }

    };

    var onKeyUp = function (event) {

        switch (event.keyCode) {

            case 38: // up
            case 87: // w
                moveForward = false;
                break;

            case 37: // left
            case 65: // a
                moveLeft = false;
                break;

            case 40: // down
            case 83: // s
                moveBackward = false;
                break;

            case 39: // right
            case 68: // d
                moveRight = false;
                break;

        }

    };

    var onMouseDown = function (event) {
        if (scope.enabled === false) return;
        raycaster.ray.origin.copy(yawObject.position);
        raycaster.ray.direction = scope.getDirection(new THREE.Vector3(0, 0, -1)).normalize();
        raycaster.far = 1000;
        var intersections = raycaster.intersectObjects(environment);
        if (intersections.length > 0) {
            var location = intersections[0];
            console.log(location);
            var point = new THREE.Vector3().copy(location.point);
            var norm = new THREE.Vector3().copy(location.face.normal).applyQuaternion(location.object.quaternion);
            point.addScaledVector(norm, event.which == 1 ? 0.02 : 0.03);
            var look = new THREE.Vector3().copy(point);
            look.addScaledVector(norm);

            var rotation = new THREE.Euler(0, 0, 0);
            rotation.set(norm.y * PI_2, norm.x * PI_2, 0);
            if (norm.z < 0) {
                rotation.set(rotation.x + Math.PI, rotation.y, 0);
            }
            if (norm.y > 0) {
                rotation.set(rotation.x, rotation.y + Math.PI, 0);
            }
            switch (event.which) {
                case 1: // left click
                    leftPortHole.shoot(point, rotation, norm);
                    break;
                case 3: // right click
                    rightPortHole.shoot(point, rotation, norm);
                    break;
            }
        }
        shotsFired = true;
    };

    document.addEventListener('mousemove', onMouseMove, false);
    document.addEventListener('keydown', onKeyDown, false);
    document.addEventListener('keyup', onKeyUp, false);
    document.addEventListener('mousedown', onMouseDown, false);

    this.enabled = false;

    this.getObject = function () {

        return yawObject;

    };

    this.getLeftPortHole = function () {

        return leftPortHole.getObject();

    };

    this.getLeftViewer = function () {

        return leftPortHole.getViewer();

    };

    this.getRightPortHole = function () {

        return rightPortHole.getObject();

    };

    this.getRightViewer = function () {

        return rightPortHole.getViewer();

    };

    this.addEnvironment = function (env) {
        environment = env;
        environment.push(leftPortHole.getObject());
        environment.push(rightPortHole.getObject());
    };

    this.isOnObject = function (boolean) {
        isOnObject = boolean;
        canJump = boolean;
    };

    this.getDirection = function () {

        // assumes the camera itself is not rotated

        var direction = new THREE.Vector3(0, 0, -1);
        var rotation = new THREE.Euler(0, 0, 0, "YXZ");

        return function (v) {

            rotation.set(pitchObject.rotation.x, yawObject.rotation.y, 0);

            v.copy(direction).applyEuler(rotation);

            return v;

        }

    }();

    this.isDead = function () {

        return dead;

    };

    this.restart = function () {
        yawObject.position.set(0, 2 * height, 0);
        dead = false;
        velocity.set(0, 0, 0);
    };

    this.update = function (renderer, scene) {

        if (scope.enabled === false) return;

        var time = performance.now();
        var delta = ( time - prevTime ) / 1000;

        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;

        velocity.y -= 9.8 * 75.0 * delta; // 100.0 = mass
        if (velocity.y < -terminalVelocity) { // falling
            velocity.y = -terminalVelocity;
        }

        if (moveForward) velocity.z -= walkSpeed * delta;
        if (moveBackward) velocity.z += walkSpeed * delta;

        if (moveLeft) velocity.x -= walkSpeed * delta;
        if (moveRight) velocity.x += walkSpeed * delta;

        if (isOnObject === true) {

            velocity.y = Math.max(0, velocity.y);

        }

        raycaster.ray.origin.copy(yawObject.position);
        raycaster.far = velocity.distanceTo(yawObject.position) * delta + width;
        raycaster.near = 0;

        if (velocity.x != 0) move(velocity.x * delta, 'x');
        if (velocity.y != 0) move(velocity.y * delta, 'y');
        if (velocity.z != 0) move(velocity.z * delta, 'z');

        if (yawObject.position.y < -50) {

            velocity.y = 0;

            canJump = true;
            dead = true;

        }

        prevTime = time;

        leftPortHole.update(renderer, scene);
        rightPortHole.update(renderer, scene);

        if (shotsFired) {
            shotsFired = false;
            return true;
        }
        else return shotsFired

    };

    var rotationDiff = function(enterNorm, exitNorm) {
        var dot = enterNorm.dot(exitNorm);
        var angle = -Math.PI + Math.acos(dot);
        var cross = new THREE.Vector3();
        cross.crossVectors(enterNorm, exitNorm);
        if (cross.y < 0) angle = -angle;
        return angle;
    };

    var move = function (vel, dir) {
        var vec = new THREE.Vector3();
        vec[dir] = 1;
        if (vel > 0) {
            var temp_vec = new THREE.Vector3().copy(vec).applyQuaternion(yawObject.quaternion);
            raycaster.ray.direction.copy(temp_vec);
        }
        else {
            var temp_vec = new THREE.Vector3().copy(vec);
            temp_vec[dir] = -1;
            temp_vec.applyQuaternion(yawObject.quaternion);
            raycaster.ray.direction.copy(temp_vec);
        }
        var intersections = raycaster.intersectObjects(environment);
        if (intersections.length == 0) {
            yawObject.translateOnAxis(vec, vel);
        }
        else {
            if (intersections[0].distance < width + 1) {
                if (intersections[0].object.name === 'left') {
                    if (portalEntered.getElapsedTime() > prevPortalTime) {
                        prevPortalTime = portalEntered.getElapsedTime() + 1;
                        var to = new THREE.Vector3().copy(rightPortHole.getObject().position).add(rightPortHole.normal);
                        var angle = rotationDiff(leftPortHole.normal, rightPortHole.normal);
                        yawObject.position.copy(to);
                        yawObject.rotation.y += angle;
                        if (yawObject.rotation.y > 2 * Math.PI) yawObject.rotation.y -= 2 * Math.PI;
                        if (yawObject.rotation.y < -2 * Math.PI) yawObject.rotation.y += 2 * Math.PI;
                    }
                }
                else if (intersections[0].object.name === 'right') {
                    if (portalEntered.getElapsedTime() > prevPortalTime) {
                        prevPortalTime = portalEntered.getElapsedTime() + 1;
                        var to = new THREE.Vector3().copy(leftPortHole.getObject().position).add(leftPortHole.normal);
                        var angle = rotationDiff(rightPortHole.normal, leftPortHole.normal);
                        yawObject.position.copy(to);
                        yawObject.rotation.y += angle;
                        if (yawObject.rotation.y > 2 * Math.PI) yawObject.rotation.y -= 2 * Math.PI;
                        if (yawObject.rotation.y < -2 * Math.PI) yawObject.rotation.y += 2 * Math.PI;
                    }
                }
            }
        }
    }

};
