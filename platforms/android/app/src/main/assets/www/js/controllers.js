angular.module('EnRed.controllers', ['ngCordova'])

.controller('AppCtrl', function($scope, $state, $ionicPopup, $cordovaToast, AuthService, AUTH_EVENTS) {
    $scope.username = AuthService.username();

    $scope.$on(AUTH_EVENTS.notAuthorized, function(event) {
        $scope.displayMessage('No Autorizado','Su usuario no esta autorizado para esta función.');
    });
  
    $scope.$on(AUTH_EVENTS.notAuthenticated, function(event) {
        AuthService.logout();
        $state.go('login');
        $scope.displayMessage('Error de sesión','Su sesión ha caducado.');
    });
  
    $scope.setCurrentUsername = function(name) {
      $scope.username = name;
    };

    $scope.displayMessage = function(title, message) {
        if(testMode) {
            var alertPopup = $ionicPopup.alert({
            title: title,
            template: message
        });
        }
        else {
            $cordovaToast.showLongBottom(message).then(
            function(success) {}, function (error) {
                console.log("toast err: ", error)
            });
        }
    }

    $scope.logout = function() {
        AuthService.logout();
        var menuLogin = document.getElementById('menuLogin');
        var menuLogout = document.getElementById('menuLogout');
        var menuNewUser = document.getElementById('menuNewUser');
        var menuAdmin = document.getElementById('menuAdmin');
        var menuAdmin = document.getElementById('menuAdmin');
        var menuResetPassword = document.getElementById('menuResetPassword');
        menuLogin.style.display = 'block';
        menuLogout.style.display = 'none';
        menuResetPassword.style.display = 'block';
        menuAdmin.style.display = 'none';
        menuNewUser.style.display = 'block'; 
        $state.go('login');
    }
  })


.controller('LoginCtrl', function($scope, $state, $ionicLoading, AuthService, USER_ROLES, $timeout) {
    $scope.data = {};
    var menuLogin = document.getElementById('menuLogin');
    var menuLogout = document.getElementById('menuLogout');
    var menuNewUser = document.getElementById('menuNewUser');
    var menuAdmin = document.getElementById('menuAdmin');
    var menuAdmin = document.getElementById('menuAdmin');
    var menuResetPassword = document.getElementById('menuResetPassword');    
        
    //usa el correo de usuario previamente usado
    var useremail = window.localStorage.getItem('EnRedUserEmail');
    if(useremail != undefined || useremail != ''){
        $scope.data.email = useremail;
        if($scope.data.email == 'jlagr@outlook.com'){
            $scope.data.password = 'Ocampo1318';
        }
    }

    $scope.login = function(data) {
        if (!isValid()) {
            return false;
        }
        //Muestra el spinner
        $ionicLoading.show({
            template: '<ion-spinner icon="ripple" class="spinner-calm"></ion-spinner>'
        });

      AuthService.login($scope.data.email, $scope.data.password).then(function(authenticated) {
        $scope.setCurrentUsername(AuthService.username());
        menuLogin.style.display = 'none';
        menuLogout.style.display = 'block';
        menuResetPassword.style.display = 'none';
        if (AuthService.role() == USER_ROLES.admin) {
            menuAdmin.style.display = 'block';
        }
        if (AuthService.role() == USER_ROLES.worker) {
            menuAdmin.style.display = 'none';
        }
        if (AuthService.role() == USER_ROLES.user){
            menuNewUser.style.display = 'none';
        }
        $timeout(function () {
                $ionicLoading.hide();
                $scope.data.password = "";
                $state.go('tab.dash', {}, {reload: true});
           }, 1000);
                
      }, function(err) {
        $ionicLoading.hide();
        $scope.displayMessage('Error de Login', err);      
      });
    }; //End login function

    function isValid() {
        if ($scope.data.email == "" || $scope.data.email == undefined) {
            return false;
        }
        else if (!validaEmail($scope.data.email)) {
            $ionicPopup.alert({
                title: 'Error de Login',
                template: 'El formato del email no es correcto.'
            });
        }
        if ($scope.data.password == "" || $scope.data.password == undefined) {
            return false;
        }
        return true;
    }; //End isValid function

    function validaEmail(email) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        var result = re.test(email.toLowerCase());
        return result;
    }; //End validEmail function
  })

    /*   -----------   Menú lateral  --------------- */

    .controller('NewUserCtrl', function ($scope, $ionicLoading, $timeout, $http, AdminService, $state) {
        $scope.data = {};

        var valBlock = document.getElementById('valBlock');
        valBlock.style.display = 'none';
        if (testMode) {
            $scope.data.nombre = "Jose Luis";
            $scope.data.email = "jose@jose.com";
            $scope.data.movil = 1234567890;
            $scope.data.password = "1jL34567890";
        };

        $scope.newUser = function () {
            //Valida que los datos introducidos esten correctos
            if (!isValid()) {
                return false;
            };
            //Muestra el spinner
            $ionicLoading.show({
                template: '<ion-spinner icon="ripple" class="spinner-calm"></ion-spinner>'
            });

            //Envia el formulario al servicio
            AdminService.addUser($scope.data.nombre,$scope.data.email,$scope.data.movil,$scope.data.proveedorMovil,$scope.data.password).then(function(authenticated) {
                //Limpia los controles del formulario
                $scope.data.nombre = "";
                $scope.data.email = "";
                $scope.data.movil = "";
                $scope.data.proveedorMovil = "Telcel";
                $scope.data.password = "";
                $timeout(function () {
                        $ionicLoading.hide();
                        $scope.displayMessage('Solicitud Enviada','Recibirá un correo cuando el administrador autorice su usuario.')
                        $state.go('login', {}, {reload: true});
                   }, 1000);
                        
              }, function(err) {
                $ionicLoading.hide();
                $scope.displayMessage('Error', err);      
              });
            }; //End login function

        function isValid() {
            var errCount = 0;
            var list = document.getElementById('valMessage');
            list.innerHTML = "";

            if ($scope.data.nombre == "" || $scope.data.nombre == undefined) {
                addErr("El nombre es un dato obligatorio");
                errCount++;
            }
            if ($scope.data.email == "" || $scope.data.email == undefined) {
                addErr("El email es un dato obligatorio.");
                errCount++;
            }
            else if (!AdminService.validaEmail($scope.data.email)) {
                addErr("El email no es válido.");
                errCount++;
            }
            if ($scope.data.movil == "" || $scope.data.movil == undefined) {
                addErr("El tel. movil es un dato obligatorio.");
                errCount++;
            }
            else if (!validaMovil($scope.data.movil)) {
                addErr("El tel. movil es invalido.");
                errCount++;
            }

            if ($scope.data.password == "" || $scope.data.password == undefined) {
                addErr("El password es un dato obligatorio.");
                errCount++;
            }
            else if (!AdminService.validaPassword($scope.data.password)) {
                addErr("El password no cumple con las reglas de seguridad.");
                errCount++;
            }
            if (errCount > 0) {
                var valBlock = document.getElementById('valBlock');
                valBlock.style.display = 'block';
            }
            else {
                var valBlock = document.getElementById('valBlock');
                valBlock.style.display = 'none';
            }
            return (errCount == 0);
        };

        function addErr(errMessage) {
            var list = document.getElementById('valMessage');
            var entry = document.createElement('li');
            entry.appendChild(document.createTextNode(errMessage));
            list.appendChild(entry);
        }

        function validaMovil(movil) {
            var re = /^\d{10}$/;
            var result = re.test(movil);
            return result;
        }
    })

    .controller('ResetPasswordCtrl', function ($scope, AdminService, $timeout, $ionicLoading, $state, $cordovaBarcodeScanner) {
        $scope.data = {};
        $scope.token = '';
        var paso1 = document.getElementById('paso1');
        var paso2 = document.getElementById('paso2');
        
        $scope.$on('$ionicView.enter', function(scope, states) {
            if(states.fromCache && states.stateName == 'tab.new'){
                paso1.style.display = 'block';
                paso2.style.display = 'none';
            }
        });

        

        $scope.PasswordReset = function(){
            if(!AdminService.validaEmail($scope.data.email)){
                $scope.displayMessage('Error','El email no es válido');
                return false;
            }
            //Muestra el spinner
            $ionicLoading.show({
                template: '<ion-spinner icon="ripple" class="spinner-calm"></ion-spinner>'
            });
            AdminService.resetPassword($scope.data.email).then(function(response) {
                //Limpia los controles del formulario
                $scope.data.email = "";
                $timeout(function () {
                        $ionicLoading.hide();
                        $scope.displayMessage('Solicitud Enviada','Recibirá un correo con el código QR para cambiar el password.')
                        $state.go('login', {}, {reload: true});
                   }, 1000);
                        
              }, function(err) {
                $timeout(function () {
                    $ionicLoading.hide();
                    $scope.displayMessage('Error', err);
               }, 1000);      
              });
        }; //End PasswordReset

        $scope.scanCode = function(){
            if(testMode){
                $scope.token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE1MTcyNjk2MjUsImF1ZCI6ImUwNDk0YzkxNGVjNzdjMmQzYjdmYzI4YTdjNGYxZmYwNWJlOTE5Y2MiLCJkYXRhIjp7ImlkIjoiMSIsImVtYWlsIjoiamxhZ3JAb3V0bG9vay5jb20iLCJub21icmUiOiJKb3NcdTAwZTkgTHVpcyBBcnR1cm8gR29uelx1MDBlMWxleiBSb2phcyJ9fQ._JeKp9yvqPUUCasw2qm-FiEB9q_jJl4GJYOGjR3sjcw";
                paso1.style.display = 'none';
                paso2.style.display = 'block';
                return true;
            }
            $cordovaBarcodeScanner.scan().then(function(barcodeData) {
                if(!barcodeData.cancelled){
                    paso1.style.display = 'none';
                    paso2.style.display = 'block';
                    $scope.token = barcodeData.text;
                    console.log("Scan successful");
                  } else {
                    console.log("Scan cancelled");
                  }
                }, function(err) {
                    $scope.displayMessage('Error', err);
                    return false;  
                });
        }; //End scanCode

        $scope.changePassword = function(){
            if($scope.data.password != $scope.data.password2){
                $scope.displayMessage('Error','Los dos passwords no coinciden.');
                return false;
            }
            if(!AdminService.validaPassword($scope.data.password)){
                $scope.displayMessage('Error','El password no cumple con las reglas de seguridad.');
                return false;
            }
            //Muestra el spinner
            $ionicLoading.show({
                template: '<ion-spinner icon="ripple" class="spinner-calm"></ion-spinner>'
            });
            AdminService.changePassword($scope.data.password,$scope.token).then(function(response) {
                //Limpia los controles del formulario
                $scope.data.password = "";
                $scope.token = '';
                paso1.style.display = 'block';
                paso2.style.display = 'none';
                $timeout(function () {
                        $ionicLoading.hide();
                        $scope.displayMessage('EnRed','Su password fué actualizado correctamente.')
                        $state.go('login', {}, {reload: true});
                   }, 1000);
                        
              }, function(err) {
                $ionicLoading.hide();
                $scope.data.password = "";
                $scope.token = '';
                paso1.style.display = 'block';
                paso2.style.display = 'none';
                $scope.displayMessage('Error', err);      
              });
            
        }; //End changePassword

        $scope.cancel = function(){
            paso1.style.display = 'block';
            paso2.style.display = 'none';
        }
    }) //End ResetPasswordCtrl

/*   -----------   Usuario  --------------- */
.controller('DashCtrl', function ($scope, Tickets) {
        $scope.dashSelectStatus = false;
        $scope.dashSelectPeriod = true;
        $scope.dashSelectNum = true;
        $scope.dashSetting = false;

        $scope.loadByStatus = function () {
            $scope.dashSetting = false;
            $scope.dashSelectStatus = false;
            $scope.dashSelectPeriod = true;
            $scope.dashSelectNum = true;
        }
        $scope.loadByPeriod = function () {
            $scope.dashSetting = false;
            $scope.dashSelectStatus = true;
            $scope.dashSelectPeriod = false;
            $scope.dashSelectNum = true;
        }
        $scope.loadByNum = function () {
            $scope.dashSetting = true;
            $scope.dashSelectStatus = true;
            $scope.dashSelectPeriod = true;
            $scope.dashSelectNum = false;
        }

        $scope.tickets = Tickets.all();
    })

.controller('TicketDetailCtrl', function ($scope, $stateParams, Tickets, User) {
        $scope.data = User.data;
        $scope.ticket = Tickets.get($stateParams.ticketId);
    })

.controller('NewCtrl', function ($scope, Tickets, $ionicPlatform, $cordovaToast, $ionicPopover, $ionicLoading,
        $timeout, $ionicPopup, FileService, $state) {
        $scope.data = {};

        $ionicPlatform.ready(function() {
            $scope.Textarea = false;
            $scope.Gallery = true;
            $scope.Map = true;
            $scope.data = FileService.getStoredTicket();
        });

        $scope.$on('$ionicView.enter', function(scope, states) {
            if(states.fromCache && states.stateName == 'tab.new'){
                $scope.showTextarea();
            }
        });

        $scope.showTextarea = function(){
            $scope.Textarea = false;
            $scope.Gallery = true;
            $scope.Map = true;
        }

        $scope.showGallery = function(){
            $scope.Textarea = true;
            $scope.Gallery = false;
            $scope.Map = true;
        }

        $scope.showMap = function(){
            $scope.Textarea = true;
            $scope.Gallery = true;
            $scope.Map = false;
        }

        $scope.preserveTicket = function() {
            FileService.storeTicket($scope.data.titulo,$scope.data.description,'-1','-1');
        }//preserveTicket

        $scope.submitTicket = function () {
            $scope.images = FileService.images();
            if (!IsValid()) { return false };
            //Muestra el spinner
            $ionicLoading.show({
                template: '<ion-spinner icon="ripple" class="spinner-calm"></ion-spinner>'
            });
            
            Tickets.submitTicket($scope.data.titulo,$scope.data.description,
                $scope.images,'-1','-1').then(function(response){
                        $timeout(function () {
                            $ionicLoading.hide();
                            FileService.removeAllImages();
                            $ionicPlatform.ready(function() {
                                $scope.data.titulo = '';
                                $scope.data.description = '';
                                ticket = '';
                                $scope.displayMessage('EnRed',"Se creó el ticket " + response);
                            });
                            $state.go('tab.dash', {}, {reload: true});
                       }, 2000);
                },
                function(err){
                    $ionicLoading.hide();
                    if(err == "Expired token "){
                        $scope.displayMessage('EnRed',"Su sesion ha caducado." + response);
                        $state.go('login', {}, {reload: true});
                    }
                    else{
                        $scope.displayMessage('EnRed',err);
                    }
                });

            function IsValid() {
                if ($scope.data.titulo == "" || $scope.data.titulo == undefined) {
                    $ionicPopup.alert({
                        title: 'Error',
                        template: 'El título es obligatorio.'
                    });
                    return false;
                };
                if ($scope.data.description == "" || $scope.data.description == undefined) {
                    $ionicPopup.alert({
                        title: 'Error',
                        template: 'La descripción es obligatoria.'
                    });
                    return false;
                }
                return true;
            } //isValid
        }//submitTicket

        $scope.cancelTicket = function() {
            var myPopup = $ionicPopup.show({
                title: 'Cancelar ticket',
                subTitle: '¿Desea limpiar toda la información de este ticket?',
                scope: $scope,
             
                buttons: [
                   { text: 'No' }, {
                      text: '<b>Si</b>',
                      type: 'button-positive',
                      onTap: function() {
                        return true;
                      }
                   }
                ]
              });
          
              myPopup.then(function(image) {
                FileService.removeAllImages();
                $ionicPlatform.ready(function() {
                  $scope.images = FileService.images();
                  $scope.data.titulo = '';
                  $scope.description = '';
                  ticket = '';
                });
              });    
        } //cancelTicket
    })

.controller('NotificationsCtrl_test', function ($scope, $http, MsgService, Mensajes, testFac) {
        //$scope.mensajes = Mensajes.all();
        //$scope.mensajes = MsgService.all($http);
        $scope.mensajes = testFac.all($http);
        $scope.mensajes = {};
        testFac.success(function (data) {
            $scope.mensajes = data.data;
        });
        $scope.remove = function (mensaje) {
            Mensajes.remove(mensaje);
        };
    })

.controller('NotificationDetailCtrl_test', function ($scope, $window, $stateParams, Mensajes) {
        $scope.mensaje = Mensajes.get($stateParams.Id);

        $scope.goToLink = function (url) {
            $window.open("//enreddgo.com.mx");
        };
    })

.controller('NotificationsCtrl', ['$scope', '$http', '$state',
        function ($scope, $http, $state) {
            var endpoint = 'http://enreddgo.com.mx/api/notificaciones.php';
            $http.get(endpoint).success(
                function (response) {
                    $scope.mensajes = response;

                    $scope.remove = function (mensaje) {
                        Mensajes.remove(mensaje);
                    }
                });
        }])

.controller('NotificationDetailCtrl', ['$scope', '$http', '$window', '$stateParams',
        function ($scope, $http, $window, $stateParams) {
            var endpoint = 'http://enreddgo.com.mx/api/notificaciones.php?mensageId=' + $stateParams.Id;
            $http.get(endpoint).success(
                function (response) {
                    $scope.mensaje = response[0];

                    $scope.goToLink = function (url) {
                        $window.open(url, '_system', 'location=yes');
                    }
                });
        }])

.controller('ChatsCtrl', function ($scope, Chats) {
        // With the new view caching in Ionic, Controllers are only called
        // when they are recreated or on app start, instead of every page change.
        // To listen for when this page is active (for example, to refresh data),
        // listen for the $ionicView.enter event:
        //
        //$scope.$on('$ionicView.enter', function(e) {
        //});

        $scope.chats = Chats.all();
        $scope.remove = function (chat) {
            Chats.remove(chat);
        };
    })

.controller('ChatDetailCtrl', function ($scope, $stateParams, Chats) {
        $scope.chat = Chats.get($stateParams.chatId);
    })

.controller('AccountCtrl', function ($scope, $state, $ionicLoading, $timeout, $ionicHistory, AuthService, AdminService, UserService) {
        $scope.data = {};

        $scope.data.nombre = AuthService.username();
        $scope.data.email = AuthService.useremail();
        $scope.data.empresa = AuthService.userempresa();
        $scope.data.movil = AuthService.usermovil();
        $scope.data.proveedorMovil = AuthService.userproveedorMovil();

        $scope.$on('$ionicView.enter', function(scope, states) {
            if(states.fromCache && states.stateName == 'tab.new'){
                $scope.data.nombre = AuthService.username();
                $scope.data.email = AuthService.useremail();
                $scope.data.empresa = AuthService.userempresa();
                $scope.data.movil = AuthService.usermovil();
                $scope.data.proveedorMovil = AuthService.userproveedorMovil();
            }
        });
        
        $scope.updateAccount = function () {
            if(!isValid()){
                return false;
            }
            
            //Muestra el spinner
            $ionicLoading.show({
                template: '<ion-spinner icon="ripple" class="spinner-calm"></ion-spinner>'
            });
            UserService.updateAccount($scope.data.nombre, $scope.data.email, $scope.data.movil, $scope.data.proveedorMovil).then(function(response) {
                $timeout(function () {
                        $ionicLoading.hide();
                        AuthService.updateUserData($scope.data.nombre, $scope.data.email, $scope.data.movil, $scope.data.proveedorMovil);
                        $scope.displayMessage('EnRed','Sus datos se actualizaron.')
                        $ionicHistory.backView().go();
                   }, 1000);
                        
              }, function(err) {
                $ionicLoading.hide();
                $scope.displayMessage('Error', err);      
              });
            
        }; //End updateAccout

        function isValid() {
            var errCount = 0;
            var list = document.getElementById('valMessage');
            list.innerHTML = "";

            if ($scope.data.nombre == "" || $scope.data.nombre == undefined) {
                addErr("El nombre es un dato obligatorio");
                errCount++;
            }
            if ($scope.data.email == "" || $scope.data.email == undefined) {
                addErr("El email es un dato obligatorio.");
                errCount++;
            }
            else if (!AdminService.validaEmail($scope.data.email)) {
                addErr("El email no es válido.");
                errCount++;
            }
            if ($scope.data.movil == "" || $scope.data.movil == undefined) {
                addErr("El tel. movil es un dato obligatorio.");
                errCount++;
            }
            else if (!validaMovil($scope.data.movil)) {
                addErr("El tel. movil es invalido.");
                errCount++;
            }
            if (errCount > 0) {
                var valBlock = document.getElementById('valBlock');
                valBlock.style.display = 'block';
            }
            else {
                var valBlock = document.getElementById('valBlock');
                valBlock.style.display = 'none';
            }
            return (errCount == 0);
        };

        function addErr(errMessage) {
            var list = document.getElementById('valMessage');
            var entry = document.createElement('li');
            entry.appendChild(document.createTextNode(errMessage));
            list.appendChild(entry);
        }

        function validaMovil(movil) {
            var re = /^\d{10}$/;
            var result = re.test(movil);
            return result;
        }

        $scope.logout = function () {
            //Muestra la opcion de login del menu y oculta la de logout
            var menuLogin = document.getElementById('menuLogin');
            var menuLogout = document.getElementById('menuLogout');
            var menuNewUser = document.getElementById('menuNewUser');
            var menuAdmin = document.getElementById('menuAdmin');
            var menuResetPassword = document.getElementById('menuResetPassword');
            menuLogin.style.display = 'block';
            menuLogout.style.display = 'none';
            menuNewUser.style.display = 'block';
            menuAdmin.style.display = 'none';
            menuResetPassword.style.display = 'block';
            AuthService.logout();
            $state.go('login');
        };
    }) //End AccountCtrl

    /*   -----------   Administración  --------------- */
.controller('AdminUsersCtrl', function ($scope, $rootScope, $ionicLoading, $timeout, AdminService) {
        $scope.appUsers = {};
        $scope.data = {};
        $scope.appAllUsers = {};
        
        $rootScope.$on("RefreshAllUsers", function(event) {
            $scope.doRefresh();
        });

        loadAll = function() {
            $ionicLoading.show({
                template: '<ion-spinner icon="ripple" class="spinner-calm"></ion-spinner>'
            });

            AdminService.loadAllUsers().then(function(res){
                $timeout(function () {
                    $ionicLoading.hide();
                    $scope.appAllUsers = res;
                    $scope.appUsers = $scope.appAllUsers;
                }, 1000);
            },
            function(err){
                $timeout(function () {
                    $ionicLoading.hide();
                    $scope.displayMessage('Error', 'El servicio no responde.');
                }, 1000); 
            })
        }; //End load all

        loadAll();
        
        $scope.doRefresh = function (){
            console.log("refresing");
            $timeout(function () {
                loadAll();
                $scope.data.estatus = "Todos"
                $scope.$broadcast("scroll.infiniteScrollComplete");
                $scope.$broadcast('scroll.refreshComplete');
            }, 1000); 
        };

        //Applica el filtro
        $scope.loadByStatus = function(){
            $scope.appUsers = [];
            switch ($scope.data.estatus){
                case "Activos":
                    for (var i = 0; i < $scope.appAllUsers.length; i++) {
                        if ($scope.appAllUsers[i].activo === "1") {
                            $scope.appUsers.push($scope.appAllUsers[i]);
                        };
                    };
                    break;
                case "Inactivos":
                    for (var i = 0; i < $scope.appAllUsers.length; i++) {
                        if ($scope.appAllUsers[i].activo === "0") {
                            $scope.appUsers.push($scope.appAllUsers[i]);
                        };
                    };
                    break;
                default:
                    $scope.appUsers = $scope.appAllUsers;
            };
        };
    })

.controller('AdminUsersDetailCtrl', function ($scope, $rootScope, $stateParams,$ionicLoading, $ionicHistory, $timeout, AdminService) {
    $scope.appUser = {};
    $scope.data = {};
    $scope.empresas = {};

    //Llama al servicio que llena el combo de las empresas
    AdminService.getEmpresas().then(function(result){
        $scope.empresas = result;
    }, function(err) {
        $scope.displayMessage('Error', err);
    });

    //Llamar al servicio que regrese los datos del usuario
    AdminService.getAppUser($stateParams.id).then(function(data) {
        $scope.appUser = data[0];
        $scope.data.nombre = $scope.appUser["nombre"];
        $scope.data.email = $scope.appUser["email"];
        $scope.data.movil = formatPhone($scope.appUser["movil"]);
        $scope.data.proveedorMovil = $scope.appUser["proveedorMovil"];
        $scope.data.empresa = $scope.appUser["empresa"];
        switch ($scope.appUser["rol"]){
            case "1": $scope.data.rol = 'Administrador';break;
            case "2": $scope.data.rol = "Trabajador"; break;
            default: $scope.data.rol = "Usuario";
        }
        $scope.data.activo = ($scope.appUser["activo"] == "1");
      }, function(err) {
        $scope.displayMessage('Error', err);
      });

      function formatPhone(text) {
        return text.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
      };

    $scope.updateUser = function(){
        //Valida que los datos básicos esten completos.
        //console.log("Empresa: ",$scope.data.empresa,", Rol:", $scope.data.rol, ", Activo: ", $scope.data.activo);
        if($scope.data.empresa <= 0){
            $scope.displayMessage("Error", "Debe seleccionar una empresa.");
            return false;
        }
        if($scope.data.rol == ""){
            $scope.displayMessage("Error", "Debe seleccionar una rol.");
            return false;
        }
        $ionicLoading.show({
            template: '<ion-spinner icon="ripple" class="spinner-calm"></ion-spinner>'
        });
        AdminService.updateUser($stateParams.id, $scope.data.empresa, $scope.data.rol, 
            $scope.data.activo, $scope.data.email, $scope.data.nombre).then(function(res) {
            if(res){
                $timeout(function () {
                    $ionicLoading.hide();
                    $ionicHistory.backView().go();
                    $rootScope.$broadcast("RefreshAllUsers");
                    $scope.displayMessage("EnRed","Se actualizó el usuario correctamente.");
                }, 1000);
            }
            else{
                $scope.displayMessage("Error",res.msg);
            }
          }, function(err) {
            $timeout(function () {
                $ionicLoading.hide();
                $scope.displayMessage('Error', err);
            }, 1000);
          });
    }
})

.controller('AdminNotificationsCtrl', function () {

    })

.controller('AdminNotificationDetailCtrl', function () {

    })
