enchant();

var obstacles = [];
window.addEventListener('load', function(){
    var game = new Game(640, 640);
    game.preload('tibi.png', 'earth.png');
    game.fps = 30;
    game.addEventListener('load', function(){
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
        // for(var i = 0; i < 100; i++){
        //     var obstacle = new Obstacle(scene, camera);
        //     obstacles.push(obstacle);
        //     obstacles[i].key = i;
        // }
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
            if(input.left){ camera.sidestep(0.1); camera.x += 1; camera.centerX = camera.x;}
            if(input.right){ camera.sidestep(-0.1); camera.x -= 1; camera.centerX = camera.x;}
            if(input.up){ camera.altitude(0.1); camera.y += 1; camera.centerY = camera.y;}
            if(input.down){ camera.altitude(-0.1); camera.y -= 1; camera.centerY = camera.y;}
            if(input.a){
                if(game.frame % 5 == 0){
                    new Shot(scene, camera);
                }
            }
            if(game.frame % 60 == 0){
                new Obstacle(scene, camera, camera.x, camera.y);
            }
        });
    },false);
    game.start();
}, false);

var Obj = enchant.Class.create(enchant.gl.primitive.Sphere, {
    initialize: function(scene, r){
        enchant.gl.primitive.Sphere.call(this, r);
        this.az = 0;
        this.theta = 0;
        this.matrix = new mat4.create();
        this.mesh.ambient = [0.3, 0.3, 0.3, 1.0];
        this.mesh.diffuse = [0.5,0.5, 0.5, 1.0];
        this.mesh.specular = [0.5, 0.5, 0.5, 1.0];
        // オブジェクトをゆっくり回転させる
        this.addEventListener('enterframe', function(e){
            mat4.identity(this.matrix);
            this.theta += 0.05;
            mat4.rotateY(this.matrix, this.theta);
            this.rotation = this.matrix;
        });
        scene.addChild(this);
    },
    remove: function(scene){
        scene.removeChild(this);
        delete this;
    }
});
var Obstacle = enchant.Class.create(Obj, {
    initialize: function(scene, camera, x, y, z){
        if(typeof x === 'undefined'){
            var diff = Math.floor(Math.random() * 2) == 0 ? 1 : -1;
            x = camera.x + Math.floor(Math.random() * 50 *  diff);
        }
        if(typeof y === 'undefined'){
            var diff = Math.floor(Math.random() * 2) == 0 ? 1 : -1;
            y = camera.y + Math.floor(Math.random() * 50 * diff);
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
        this.mesh.texture = new Texture('earth.png');
        this.key = 0;
        this.addEventListener('enterframe', function(e){
            this.az -= 0.1;
            this.z += this.az;
            if(this.z < camera.z){
                this.remove(scene);
            }
        });
    },
    key: function(i){
        if(typeof i === 'undefined'){
            return this.key;
        }
        this.key = i;
    }
});

var Shot = enchant.Class.create(Obj, {
    initialize: function(scene, camera, r){
        if(typeof r === 'undefined'){
            r = 0.1;
        }
        Obj.call(this, scene, r);
        this.mesh.setBaseColor("#f18b8c");
        this.x = camera.x;
        this.y = camera.y - 1;
        this.z = camera.z + 5;
        this.addEventListener('enterframe', function(e){
            this.az += 1;
            this.z += this.az;
            if(this.z > 500){
                this.remove(scene);
            }
            
        });
    }
});
