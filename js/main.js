//global variation
    if (!Detector.webgl) {
        Detector.addGetWebGLMessage();
    }

    var container;

    var camera, controls, scene, renderer;
    var lighting, ambient, keyLight, fillLight, backLight;
    var mouse, raycaster;
    var objects=[];
    var plunger,shield,frontCap,workStation,tweezer;
    var plungerAnimation, shieldAnimation, capAnimation, workStationAnimation, tweezerAnimation;
    var clickIndex_mainUnit;
    var plungerUp= false;
    var shieldDown= false;
    var capDown = false;
    var workStationGo= false;
    var skyMaterial;
    var params = {
      opacity: 1.0,
      roughness: 1.0,
      bumpScale: 1.0,
      exposure: 3.0,
      whitePoint: 5.0,
      toneMapping: "Uncharted2",
      renderMode: "Renderer"
    };
    var toneMappingOptions = {
      None: THREE.NoToneMapping,
      Linear: THREE.LinearToneMapping,
      Reinhard: THREE.ReinhardToneMapping,
      Uncharted2: THREE.Uncharted2ToneMapping,
      Cineon: THREE.CineonToneMapping
    };

    var meshNameList = ["polySurface80 polySurface76 polySurface68",//CP3Main_0
                        "Temp14:Mesh",//Workstation_1
                        "Temp10:PlungerMesh",//Plunger_2
                        "Temp13:Tweezers7",//Tweezers_3
                        "polySurface73",//blotter_4
                        "CP3HumidityChamberMesh:pCylinder4 CP3HumidityChamberMesh:polySurface2 CP3HumidityChamberMesh:polySurface1",//humidity1_5
                        "CP3HumidityChamberMesh:polySurface2 CP3HumidityChamberMesh:polySurface3 CP3HumidityChamberMesh:polySurface70 CP3HumidityChamberMesh:polySurface1",//humidity2_6
                        "CP3HumidityChamberMesh:pCylinder2 CP3HumidityChamberMesh:polySurface2 CP3HumidityChamberMesh:polySurface1",//humidity3_7
                        "Temp:DisplayMesh CP3MainGrp",//hygrometer_8
                        "Temp11:polySurface22",//Sponge_9
                        "polySurface78",
                        "polySurface77"
                      ];

//init
    init();

    function init() {
        container = document.createElement('div');
        document.body.appendChild(container);
        scene = new THREE.Scene();

        //renderer
        renderer = new THREE.WebGLRenderer();
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);

        renderer.setClearColor(new THREE.Color(0xffffff));
        container.appendChild(renderer.domElement);

        // camera setting
        var fov=45;
        var near=80;
        var far=3000;
        camera = new THREE.PerspectiveCamera(fov, (window.innerWidth) / window.innerHeight, near, far);
        camera.position.x= -90;
        camera.position.y= -90;
        camera.position.z= 0;
        //Orbit control
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.7;
        controls.enableZoom = true;
        controls.enablePan = false;
        controls.screenSpacePanning = false;
				controls.maxPolarAngle = (Math.PI / 2);
        controls.maxDistance = 300;
        controls.minDistance = 120;

        // light
        lighting = false;
        ambient = new THREE.AmbientLight(0xffffff, 0.2);
        scene.add(ambient);
        keyLight = new THREE.DirectionalLight(new THREE.Color('hsl(59, 89%, 98%)'), 1.0);
        keyLight.position.set(-200, 0, 0);
        fillLight = new THREE.DirectionalLight(new THREE.Color('hsl(179, 89%, 98%)'), 0.7);
        fillLight.position.set(100, 100, -200);
        backLight = new THREE.DirectionalLight(0xffffff, 1.0);
        backLight.position.set(100, 50, 100).normalize();
        ambient.intensity = 0.20;
        scene.add(keyLight);
        scene.add(fillLight);
        scene.add(backLight);
        //info box
        // var info = document.createElement( 'div' );
        // var icon = document.createElement('img');
        // info.appendChild(icon);
        // img.style.src = 'CP3Logo/burger.png';
				// info.style.position = 'absolute';
				// info.style.top = '30px';
				// info.style.width = '30px';
				// info.style.textAlign = 'center';
        // info.style.fontSize = '32px';
        // info.style.background = "url(CP3Logo/burger.png)";
				// info.innerHTML = '111';
        // // info.style.background ="#000";
				// container.appendChild( info );


        //sprite
        canvas1 = document.createElement('canvas');
        context1 = canvas1.getContext('2d');
        context1.font = "Bold 20px Arial";
      	context1.fillStyle = "rgba(0,0,0,0.95)";
        context1.fillText('Hello, world!', 0, 20);
        //canvas contents will be used for Material
        texture1 = new THREE.Texture(canvas1);
        texture1.needsUpdate = true;
        var spriteMaterial = new THREE.SpriteMaterial( { map: texture1} );
        var sprite = new THREE.Sprite( spriteMaterial );
        sprite.scale.set(20, 10, 1);
        sprite.position.set(5, 20, 20);
        //scene.add(sprite);

        //sky
        //faked refraction
        var r = "skyCube/";
        var urls = [
          r + "posx.jpg", r + "negx.jpg",
          r + "posy.jpg", r + "negy.jpg",
          r + "posz.jpg", r + "negz.jpg"
        ];

        var reflectionCube = new THREE.CubeTextureLoader().load( urls );
	      reflectionCube.format = THREE.RGBFormat;
        var refractionCube = new THREE.CubeTextureLoader().load( urls );
	      refractionCube.mapping = THREE.CubeRefractionMapping;
        new THREE.RGBELoader().load( 'hdr/EnvTex_New_retarget.hdr',  function( texture, textureData ) {
        					//console.log( textureData );
        					//console.log( texture );
        					texture.encoding = THREE.RGBEEncoding;
        					texture.minFilter = THREE.NearestFilter;
        					texture.magFilter = THREE.NearestFilter;
        					//texture.flipY = true;
        					var skyMaterial = new THREE.MeshBasicMaterial( { map: texture } );

                  //load sphere
                  //sphere
                  var objLoader = new THREE.OBJLoader();
                  objLoader.setPath('hdr/');
                  objLoader.load('Env_Sphere_orient.obj', function (object) {
                    object.scale.set(40, 40, 40);
                    object.rotation.set(0 , 80.25, 0);
                      scene.add(object);
                      scene.traverse(function(child){
                        //objects.push(child);
                        if ( child instanceof THREE.Mesh ) {
                          if (child.name == ""){
                            child.material = skyMaterial;
                          }

                             }
                      })

                  });

        				} );


//Texture& material
        var manager = new THREE.LoadingManager();
        var loader = new THREE.ImageLoader( manager );
        var mainUnit_diffuse = new THREE.Texture();
        var workStation_diffuse = new THREE.Texture();
        var blotter_diffuse = new THREE.Texture();
        var hygrometer_diffuse = new THREE.Texture();
        var tweezer_sponge_diffuse = new THREE.Texture();
        var mainUnit_alpha = new THREE.Texture();
        var hygrometer_alpha = new THREE.Texture();
        var table_diffuse = new THREE.Texture();

        //maps for Phong
        loader.load('allAssets/CP3MainBodyTex.jpg', function( image ){
          mainUnit_diffuse.image = image;
          mainUnit_diffuse.needsUpdate = true;

        })

        loader.load('allAssets/Blotter_Tex.jpg', function( image ){
          blotter_diffuse.image = image;
          blotter_diffuse.needsUpdate = true;

        })

        loader.load('allAssets/WorkstationTex.jpg', function( image ){
          workStation_diffuse.image = image;
          workStation_diffuse.needsUpdate = true;

        })

        loader.load('allAssets/DisplayTex.jpg', function( image ){
          hygrometer_diffuse.image = image;
          hygrometer_diffuse.needsUpdate = true;

        })

        loader.load('allAssets/TweezerSpongeTex.jpg', function( image ){
          tweezer_sponge_diffuse.image = image;
          tweezer_sponge_diffuse.needsUpdate = true;

        })

        loader.load('allAssets/CP3MainBodyOpacityTex.jpg', function( image ){
          mainUnit_alpha.image = image;
          mainUnit_alpha.needsUpdate = true;

        })

        loader.load('allAssets/DisplayOpacityTex.jpg', function( image ){
          hygrometer_alpha.image = image;
          hygrometer_alpha.needsUpdate = true;

        })

        loader.load('allAssets/TableMeshTex.jpg', function( image ){
          table_diffuse.image = image;
          table_diffuse.needsUpdate = true;

        })

        //Phong
        var mainUnit_Standard = new THREE.MeshStandardMaterial({
          map : mainUnit_diffuse,
          alphaMap :mainUnit_alpha,
          //shininess : 50,
          side: THREE.DoubleSide,
          //envMap:refractionCube,
          // refractionRatio: 0.1,
          roughness:0.5,
          metalness:0.7

        });
        mainUnit_Standard.transparent = true;
        //materialPhong1.blending = THREE.AdditiveBlending;
        //mainUnit_Standard.depthTest = false;

        var humidityChamber_Phong = new THREE.MeshPhongMaterial({
          map : mainUnit_diffuse,
          alphaMap :mainUnit_alpha,
          shininess : 500,
          side: THREE.DoubleSide,
          //alphaTest: 0.5,
          transparent:true,
          depthTest:true,
          //depthWrite: false,
          //alphaTest: 1

        });
        //humidityChamber_Phong.needsUpdate = true;
        //humidityChamber_Phong.transparent = true;
        //humidityChamber_Phong.envMap.mapping = THREE.CubeRefractionMapping;

        var plunger_Phong = new THREE.MeshStandardMaterial({
          map : mainUnit_diffuse,
          alphaMap :mainUnit_alpha,
          roughness: 0.4,
          metalness:0.5,
          side: THREE.DoubleSide

        });

        var tweezer_Phong = new THREE.MeshPhongMaterial({
          map : tweezer_sponge_diffuse,
          alphaMap :mainUnit_alpha,
          shininess : 500,
          side: THREE.DoubleSide

        });

        var blotter_Phong = new THREE.MeshPhongMaterial({
          map : blotter_diffuse,
          shininess : 500,
        });

        var workStation_Phong = new THREE.MeshPhongMaterial({
          map : workStation_diffuse,
          shininess : 500,
        });

        var sponge_Phong = new THREE.MeshPhongMaterial({
          map : tweezer_sponge_diffuse,
          shininess : 500,
        });

        var hygrometer_Phong = new THREE.MeshPhongMaterial({
          map : hygrometer_diffuse,
          alphaMap : hygrometer_alpha,
          shininess : 0,
        });
        hygrometer_Phong.transparent = true;



        var shield_Phong = new THREE.MeshPhongMaterial({
          color:0xccddff,
          alphaMap :mainUnit_alpha,
          shininess : 800,
          side: THREE.DoubleSide,
          // envMap:textureCube,
          refractionRatio: 0.1,
          reflectivity: 0.4
        });
        shield_Phong.transparent = true;

        var frontCap_Phong = new THREE.MeshPhongMaterial({
          map : mainUnit_diffuse,
          alphaMap :mainUnit_alpha,
          shininess : 500,
          side: THREE.DoubleSide

        });
        frontCap_Phong.transparent = true;

        var table_Standard = new THREE.MeshStandardMaterial({
          map : table_diffuse,
          //shininess : 50,
          side: THREE.DoubleSide,
          //envMap:refractionCube,
          // refractionRatio: 0.1,
          roughness:0.7,
          metalness:0.7

        });


        //OBJ smodel


        var objLoader = new THREE.OBJLoader();
        objLoader.setPath('allAssets/');
        objLoader.load('CP3MainMesh_separate.obj', function (object) {
            object.position.x=0;
            object.position.y=-36;
            scene.add(object);
            scene.traverse(function(child){
              objects.push(child);
              if ( child instanceof THREE.Mesh ) {
                       if (child.name == meshNameList[0]){
                         child.material = mainUnit_Standard;
                         child.material.envMap = refractionCube;
                         //child.material.metalness = 0.1;
                       }
                   }
            })

        });

        //2.workStation
            var objLoader = new THREE.OBJLoader();
            objLoader.setPath('allAssets/');
            objLoader.load('CP3WorkStationMesh.obj', function (object) {
                object.position.x=0-16;
                object.position.y=-36;
                workStation = object;
                scene.add(object);
                scene.traverse(function(child){
                  objects.push(child);
                  if ( child instanceof THREE.Mesh ) {
                           if (child.name == meshNameList[1]){
                             child.material = workStation_Phong;
                           }
                       }
                })

            });

        //3.plunger
            var objLoader = new THREE.OBJLoader();
            objLoader.setPath('allAssets/');
            objLoader.load('CP3PlungerMesh.obj', function (object) {
                object.position.x=0;
                object.position.y=-36;
                plunger = object;
                scene.add(object);
                scene.traverse(function(child){
                  objects.push(child);
                  if ( child instanceof THREE.Mesh ) {
                           if (child.name == meshNameList[2]){
                             child.material = plunger_Phong;
                           }
                       }
                })

            });

        //4.tweezers
            var objLoader = new THREE.OBJLoader();
            objLoader.setPath('allAssets/');
            objLoader.load('CP3TweezerMesh.obj', function (object) {
                object.position.x=0;
                object.position.y=-36;
                tweezer = object;
                scene.add(object);
                scene.traverse(function(child){
                  objects.push(child);
                  if ( child instanceof THREE.Mesh ) {
                           if (child.name == meshNameList[3]){
                             child.material = tweezer_Phong;
                           }
                       }

                })

            });

        //5.blotter
            var objLoader = new THREE.OBJLoader();
            objLoader.setPath('allAssets/');
            objLoader.load('CP3BlotterMesh.obj', function (object) {
                object.position.x=0;
                object.position.y=-36;
                scene.add(object);
                scene.traverse(function(child){
                  objects.push(child);
                  if ( child instanceof THREE.Mesh ) {
                           if (child.name == meshNameList[4]){
                             child.material = blotter_Phong;
                           }
                       }

                })

            });



        //7.hygrometer
            var objLoader = new THREE.OBJLoader();
            objLoader.setPath('allAssets/');
            objLoader.load('CP3HygrometerMesh.obj', function (object) {
                object.position.x=0;
                object.position.y=-36;
                scene.add(object);
                scene.traverse(function(child){
                  objects.push(child);
                  if ( child instanceof THREE.Mesh ) {
                           if (child.name == meshNameList[8]){
                             child.material = hygrometer_Phong;
                           }
                       }
                })

            });

        //8.sponge
            var objLoader = new THREE.OBJLoader();
            objLoader.setPath('allAssets/');
            objLoader.load('CP3SpongerMesh.obj', function (object) {
                object.position.x=0;
                object.position.y=-36;
                scene.add(object);
                scene.traverse(function(child){
                  objects.push(child);
                  if ( child instanceof THREE.Mesh ) {
                           if (child.name == meshNameList[9]){
                             child.material = sponge_Phong;
                           }
                       }
                })

            });

            //9.frontCap
                var objLoader = new THREE.OBJLoader();
                objLoader.setPath('allAssets/');
                objLoader.load('CP3FrontCapMesh.obj', function (object) {
                    object.position.set(-3.239, 27.817-36, -4.017)
                    frontCap = object;
                    scene.add(object);
                    scene.traverse(function(child){
                      objects.push(child);
                      if ( child instanceof THREE.Mesh ) {
                               if (child.name == meshNameList[11]){
                                 child.material = frontCap_Phong;
                               }
                           }
                    })

                });
              //9.CP3ShieldMesh
              var objLoader = new THREE.OBJLoader();
              objLoader.setPath('allAssets/');
              objLoader.load('CP3ShieldMesh.obj', function (object) {
                  object.position.set(10.691, 15.387-36, -0.501);
                  shield = object;
                  scene.add(object);
                  scene.traverse(function(child){
                    objects.push(child);
                    if ( child instanceof THREE.Mesh ) {
                             if (child.name == meshNameList[10]){
                               child.material = shield_Phong;
                               child.material.envMap = refractionCube;
                               child.material.refractionRatio = 0.4;
                             }
                         }
                  })

              });
              //6.humidityChamber
                  var objLoader = new THREE.OBJLoader();
                  objLoader.setPath('allAssets/');
                  objLoader.load('CP3HumidityChamberMesh2.obj', function (object) {
                      object.position.x=0;
                      object.position.y=-36;
                      scene.add(object);
                      scene.traverse(function(child){
                        objects.push(child);
                        if ( child instanceof THREE.Mesh ) {
                                 if (child.name == meshNameList[5]||
                                   child.name == meshNameList[6]||
                                   child.name == meshNameList[7]){
                                   child.material = humidityChamber_Phong;
                                   child.material.envMap = refractionCube;
                                   child.material.refractionRatio = 0.9;
                                 }

                             }
                      })

                  });
                  // table mesh
                  var objLoader = new THREE.OBJLoader();
                  objLoader.setPath('allAssets/');
                  objLoader.load('CP3_TableMesh_04.obj', function (object) {
                      object.position.set(0, -36, 0);
                      scene.add(object);
                      scene.traverse(function(child){
                        // objects.push(child);
                        if ( child instanceof THREE.Mesh ) {
                              if (child.name == "CP3_TableMesh2:UnrealEdObject"){
                                child.material = table_Standard;
                                child.material.envMap = refractionCube;
                                child.material.metalness = 0.2;
                              }
                             }
                      })

                  });


    }



//add raycaster and mosue to 2d vector
    raycaster = new THREE.Raycaster();
    var mouse = new THREE.Vector2();
    var INTERSECTED = false;

//window resize
window.addEventListener('resize',onWindowResize,false);
function onWindowResize(e){
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );

}

//onboard function
    window.addEventListener('keydown', onKeyboardEvent, false);
    function onKeyboardEvent(e) {
        if (e.code == 'Escape') {
          var labels = $(".bg-model");
          $(".bg-model,.bg-model2,.bg-model3,.bg-model4,.bg-model5,.bg-model6,.bg-model7,.bg-model8").css('display', 'none');

        }
    }

//add EventListener_mousemove
    document.addEventListener("mousemove",onDocumentMouseMove,false);
    function onDocumentMouseMove(event){
      event.preventDefault();

      mouse.x = (event.clientX / window.innerWidth)*2-1;
      mouse.y = - (event.clientY/ window.innerHeight)*2+1;
      raycaster.setFromCamera(mouse, camera);
      var intersects = raycaster.intersectObjects(objects);

      if ( intersects.length > 0 ) {if ( INTERSECTED != intersects[ 0 ].object ) {
        if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
        INTERSECTED = intersects[ 0 ].object;
        INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
        if(INTERSECTED.name != "CP3_TableMesh2:UnrealEdObject"){
          INTERSECTED.material.emissive.setHex( 0xff0000 );
          $('body').css('cursor','pointer');
        }


      }}
      else{
        if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
      INTERSECTED = null;
      $('body').css('cursor','default');
      }


      }
//add EventListener_click
      //close popUp window
      function closeWindow(){
        $(document).ready(function(){
          $(".close,.close2,.close3,.close4,.close5,.close6,.close7,.close8,.close9").click(function(){
            $(".bg-model,.bg-model2,.bg-model3,.bg-model4,.bg-model5,.bg-model6,.bg-model7,.bg-model8").css('display', 'none');
          })
        })
      }



var toggle= false;
      document.addEventListener("click",onDocumentMouseClick,false);
      function onDocumentMouseClick(event){
        event.preventDefault();
        mouse.x = (event.clientX / window.innerWidth)*2-1;
        mouse.y = - (event.clientY/ window.innerHeight)*2+1;
        raycaster.setFromCamera(mouse, camera);
        var intersects = raycaster.intersectObjects(objects);
        if (intersects.length > 0){
          this.name = intersects[0].object.name;
          //check the name of child object
          //alert(this.name);
          function show_mainUnit(){
            $(".bg-model2,.bg-model3,.bg-model4,.bg-model5,.bg-model6,.bg-model7,.bg-model8").css('display', 'none');
            $(".bg-model").css('display', 'flex');
          };
          function show_workStation(){
            $(".bg-model,.bg-model3,.bg-model4,.bg-model5,.bg-model6,.bg-model7,.bg-model8").css('display', 'none');
            $(".bg-model2").css('display', 'flex');
          };
          function show_plunger(){
            $(".bg-model,.bg-model2,.bg-model4,.bg-model5,.bg-model6,.bg-model7,.bg-model8").css('display', 'none');
            $(".bg-model3").css('display', 'flex');
          }
          function show_tweezer(){
            $(".bg-model,.bg-model2,.bg-model3,.bg-model5,.bg-model6,.bg-model7,.bg-model8").css('display', 'none');
            $(".bg-model4").css('display', 'flex');
          };
          function show_blotter(){
            $(".bg-model,.bg-model2,.bg-model3,.bg-model4,.bg-model6,.bg-model7,.bg-model8").css('display', 'none');
            $(".bg-model5").css('display', 'flex');
          };
          function show_humidityChamber(){
            $(".bg-model,.bg-model2,.bg-model3,.bg-model4,.bg-model5,.bg-model7,.bg-model8").css('display', 'none');
            $(".bg-model6").css('display', 'flex');
          };
          function show_hygrometer(){
            $(".bg-model,.bg-model2,.bg-model3,.bg-model4,.bg-model5,.bg-model6,.bg-model8").css('display', 'none');
            $(".bg-model7").css('display', 'flex');
          };
          function show_sponge(){
            $(".bg-model,.bg-model2,.bg-model3,.bg-model4,.bg-model5,.bg-model6,.bg-model7").css('display', 'none');
            $(".bg-model8").css('display', 'flex');
          };
          function hide(){
            $(".bg-model,.bg-model2,.bg-model3,.bg-model4,.bg-model5,.bg-model6,.bg-model7,.bg-model8").css('display', 'none');
          }

          if (this.name === meshNameList[0]) {
              if(toggle == false){
                show_mainUnit();
                toggle = !toggle;
              }
              else{
                hide();
                toggle = !toggle;
              }
              closeWindow();
            }

            else if (this.name === meshNameList[1]) {
              workStationAnimation= true;
              workStationGo= !workStationGo;
              if(toggle == false){
                show_workStation();
                toggle = !toggle;
              }
              else{
                hide();
                toggle = !toggle;
              }
              closeWindow();
            }

            else if (this.name === meshNameList[2]) {
              plungerAnimation= true;
              tweezerAnimation = true;
              plungerUp = !plungerUp;
              if(toggle == false){
                show_plunger();
                toggle = !toggle;
              }
              else{
                hide();
                toggle = !toggle;
              }
              closeWindow();
            }

            else if (this.name === meshNameList[3]) {
              if(toggle == false){
                show_tweezer();
                toggle = !toggle;
              }
              else{
                hide();
                toggle = !toggle;
              }
              closeWindow();
            }

            else if (this.name === meshNameList[4]) {
              if(toggle == false){
                show_blotter();
                toggle = !toggle;
              }
              else{
                hide();
                toggle = !toggle;
              }
              closeWindow();
            }

            else if (this.name === meshNameList[5]||this.name === meshNameList[6]||this.name === meshNameList[7]) {
              if(toggle == false){
                show_humidityChamber();
                toggle = !toggle;
              }
              else{
                hide();
                toggle = !toggle;
              }
              closeWindow();
            }

            else if (this.name === meshNameList[8]) {
              if(toggle == false){
                show_hygrometer();
                toggle = !toggle;
              }
              else{
                hide();
                toggle = !toggle;
              }
              closeWindow();
            }

            else if (this.name === meshNameList[9]) {
              if(toggle == false){
                show_sponge();
                toggle = !toggle;
              }
              else{
                hide();
                toggle = !toggle;
              }
              closeWindow();
            }

            if (this.name === meshNameList[10]) {
                shieldAnimation = true;
                shieldDown = !shieldDown;
              }

              if (this.name === meshNameList[11]) {
                  capAnimation = true;
                  capDown = !capDown;
                }

          }

          }

//function for render, requestAnimationFrame隔一段时间调用一次;
//plungerAnimaion

function animate(){
    requestAnimationFrame(animate);
    var speed = 0;
    if( plungerAnimation == true){
      if(plungerUp == true){
        if (plunger.position.y > -21) {
            speed = 0;
        }
        else{
            speed = 0.1;
        }
        plunger.translateOnAxis(new THREE.Vector3(0, 1, 0).normalize(), speed)
        }else{
          if (plunger.position.y < -36) {
              speed = 0;
            }else{
              speed = -0.1;
            }
          plunger.translateOnAxis(new THREE.Vector3(0, 1, 0).normalize(), speed)
        }
    }

//shieldAnimation
    var rotateRate = 0;
    if(shieldAnimation == true){
      if( shieldDown == true ){
        //shield.rotation.y -= 0.35* Math.PI/180;
        // console.log(shield.rotation.y);
        if(shield.rotation.y <= - Math.PI/2){
          rotateRate = 0;
        }else{
          rotateRate = -1* Math.PI/180;
        }
        shield.rotateOnAxis(new THREE.Vector3(0, 1, 0).normalize(),rotateRate )
      }
      else{
        if(shield.rotation.y > 0){
          rotateRate = 0;
        }else{
          rotateRate = 1* Math.PI/180;
        }
        shield.rotateOnAxis(new THREE.Vector3(0, 1, 0).normalize(),rotateRate )
      }
    }

//capAnimation
var capRotateRate = 0;
    if(capAnimation == true){
      if(capDown == true){
        if( frontCap.rotation.x <= -Math.PI){
          capRotateRate = 0;
        }else{
          capRotateRate = -2* Math.PI/180;
        }
      frontCap.rotateOnAxis(new THREE.Vector3(1, 0, 0).normalize(), capRotateRate)
      }
    else{

      if(frontCap.rotation.x > 0){
        capRotateRate = 0;
      }else{
        capRotateRate = 2* Math.PI/180;
      }
      frontCap.rotateOnAxis(new THREE.Vector3(1, 0, 0).normalize(), capRotateRate)
    }

      //frontCap.rotation.x -= 0.8* Math.PI/180;
    }

//workStation
    //workStation.position.x += 0.5;
    var workStation_speed = 0;
    if( workStationAnimation == true){
      // console.log(workStation.position.x);
      if(workStationGo == true){
        if (workStation.position.x > 0) {
            workStation_speed = 0;
        }
        else{
            workStation_speed = 0.5;
        }
        workStation.translateOnAxis(new THREE.Vector3(1, 0, 0).normalize(), workStation_speed)
        }else{
          if (workStation.position.x < -18) {
              workStation_speed = 0;
            }else{
              workStation_speed = -0.5;
            }
          workStation.translateOnAxis(new THREE.Vector3(1, 0, 0).normalize(), workStation_speed)
        }
    }

//tweezerAnimation
if( tweezerAnimation == true){
  if(plungerUp == true){
    if (plunger.position.y > -21) {
        speed = 0;
    }
    else{
        speed = 0.1;
    }
    tweezer.translateOnAxis(new THREE.Vector3(0, 1, 0).normalize(), speed)
    }else{
      if (plunger.position.y < -36) {
          speed = 0;
        }else{
          speed = -0.1;
        }
      tweezer.translateOnAxis(new THREE.Vector3(0, 1, 0).normalize(), speed)
    }
}

    renderer.toneMapping = toneMappingOptions[ params.toneMapping ];
    renderer.render(scene,camera);
    renderer.sortObjects = false;
    //toneMappingOptions

    //renderer.toneMappingExposure = params.;
    controls.update();

};

    animate();
