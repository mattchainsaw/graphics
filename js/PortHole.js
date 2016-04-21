
THREE.PortHole = function(scene, color) {

    var portal = new THREE.CubeCamera(0.1, 100, 1024);
    portal.renderTarget.texture.minFilter = THREE.LinearMipMapLinearFilter;
    var other_portal;

    var geometry = new THREE.RingGeometry(0.0001, 8);
    var material = new THREE.MeshPhongMaterial();
    var body = new THREE.Mesh(geometry, material);
    this.normal = new THREE.Vector3();

    this.shoot = function (position, rotation, look, normal) {
        body.position.copy(position);
        body.rotation.copy(rotation);
        portal.position.copy(position);
        portal.scale.x = -1; // for mirror
        portal.lookAt(look);
        this.normal = normal;
        //portal.rotation.copy(rotation);
    };

    this.getObject = function () {
        return body;
    };

    this.getViewer = function() {
        return portal;
    };

    this.setViewer = function(port) {
        other_portal = port;
        body.material.envMap = other_portal.renderTarget;
    };

    this.update = function(renderer, scene) {
        portal.updateCubeMap(renderer, scene)
    };

};
