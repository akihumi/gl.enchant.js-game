enchant();

var obstacles = [];
var game;
window.addEventListener('load', function(){
    game = new Game(640, 640);
    game.preload('image/earth.png', 'image/sight.png', 'audio/bomb.wav', 'audio/shot.wav');
    game.fps = 24;
    game.addEventListener('load', function(){
        var sight = Sprite(100,100);
        sight.image = game.assets['image/sight.png'];
        sight.frame = 0;
        sight.width = sight.height = 100;
        sight.x = (game.width / 2) - (sight.width / 2) - 1;
        sight.y = (game.height/ 2) - (sight.height / 2) + 5;
        game.rootScene.addChild(sight);
        // create 3D scene
        var scene = new Scene3D();
        // create light
        var light = new DirectionalLight();
        light.directionZ = -1;
        light.color = [1.0, 1.0, 1.0];
        scene.setDirectionalLight(light);
        // create camera
        var camera = new Camera3D();
        camera.centerZ = 200;
        scene.setCamera(camera);
        // create obstacle
        for(var i = 0; i < 50; i++){
            var obstacle = new Obstacle(scene, camera);
            obstacle.key = i;
            obstacles.push(obstacle);
        }
        // create Sphere
//========================================================
        // 中心
        var sphere5 = new Sphere();
        sphere5.x = 0; sphere5.y = 0; sphere5.z = 50;
        sphere5.mesh.setBaseColor("#ffffff");
        scene.addChild(sphere5);
        // スペースキーを発射ボタンにする
//=======================================================
        game.keybind(32, "a");
        game.rootScene.addEventListener('enterframe', function(e){
            var input = game.input;
            if(input.left){
                camera.sidestep(0.1); camera.x += 1; camera.centerX = camera.x;
            }else if(input.right){
                camera.sidestep(-0.1); camera.x -= 1; camera.centerX = camera.x;
            }
            if(input.up){ 
                camera.altitude(0.1); camera.y += 1; camera.centerY = camera.y;
            }else if(input.down){
                camera.altitude(-0.1); camera.y -= 1; camera.centerY = camera.y;
            }
            if(input.a){
                if(game.frame % 2 == 0){
                    new Shot(scene, camera);
                    game.assets['audio/shot.wav'].play();
                }
            }
        });
    },false);
    game.start();
}, false);

var Obj = enchant.Class.create(enchant.gl.primitive.Sphere, {
    initialize: function(scene, r){
        enchant.gl.primitive.Sphere.call(this, r);
        var theta = 0;
        var matrix = new mat4.create();
        this.az = 0;
        this.scene = scene;
        this.mesh.ambient = [0.3, 0.3, 0.3, 1.0];
        this.mesh.diffuse = [0.5,0.5, 0.5, 1.0];
        this.mesh.specular = [0.5, 0.5, 0.5, 1.0];
        // オブジェクトをゆっくり回転させる
        this.addEventListener('enterframe', function(e){
            mat4.identity(matrix);
            theta += 0.1;
            mat4.rotateY(matrix, theta);
            this.rotation = matrix;
        });
        scene.addChild(this);
    },
    remove: function(){
        this.scene.removeChild(this);
        delete this;
    }
});
var Obstacle = enchant.Class.create(Obj, {
    initialize: function(scene, camera, x, y, z){
        if(typeof x === 'undefined'){
            var diff = Math.floor(Math.random() * 2) == 0 ? 1 : -1;
            x = camera.x + Math.floor(Math.random() * 30 *  diff);
        }
        if(typeof y === 'undefined'){
            var diff = Math.floor(Math.random() * 2) == 0 ? 1 : -1;
            y = camera.y + Math.floor(Math.random() * 30 * diff);
        }
        if(typeof z === 'undefined'){
            z = 100 + Math.floor(Math.random() * 200);
        }
        // 大きさはランダムで
        this.r = (Math.random() * 3).toFixed(1);
        Obj.call(this, scene, this.r);
        this.x = x;
        this.y = y;
        this.z = z;
        this.mesh.texture = new Texture('image/earth.png');
        this.addEventListener('enterframe', function(e){
            this.az -= 0.3;
            this.z += this.az;
            if(this.z < camera.z){
                var o = null;
                if(this.key == 0){
                    o = new Obstacle(scene, camera, camera.x, camera.y, 200);
                }else{
                    o = new Obstacle(scene, camera);
                }
                o.key = this.key;
                obstacles[this.key] = o;
                this.remove();
            }
        });
    },
    key: 0,
});

var Shot = enchant.Class.create(Obj, {
    initialize: function(scene, camera, r){
        if(typeof r === 'undefined'){
            r = 1;
        }
        Obj.call(this, scene, r);
        this.x = camera.x;
        this.y = camera.y - 1;
        this.z = camera.z + 5;
        this.mesh.setBaseColor("#f16b5c");
        this.addEventListener('enterframe', function(e){
            this.az += 1.5;
            this.z += this.az;
            for(var i = 0; i < obstacles.length; i++){
                var ob = obstacles[i];
                var hitarea = 20;
                if(this.bounding.toBS(ob.bounding) < hitarea){
                    var o = null;
                    if(this.key == 0){
                        o = new Obstacle(scene, camera, camera.x, camera.y, 200);
                    }else{
                        o = new Obstacle(scene, camera);
                    }
                    o.key = ob.key;
                    obstacles[ob.key] = o;
                    ob.remove();
                    this.remove();
                    game.assets['audio/bomb.wav'].play();
                }
            }
            if(this.z > 500){
                this.remove();
            }
        });
    }
});
