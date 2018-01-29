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
        if(testMode){
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
        
        paso1.style.display = 'block';
        paso2.style.display = 'none';

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
                        $scope.displayMessage('Solicitud Enviada','Recibirá un correo con el token para cambiar el password.')
                        $state.go('login', {}, {reload: true});
                   }, 1000);
                        
              }, function(err) {
                $ionicLoading.hide();
                $scope.displayMessage('Error', err);      
              });
        }; //End PasswordReset

        $scope.scanCode = function(){
            $cordovaBarcodeScanner.scan().then(function(barcodeData) {
                //paso1.style.display = 'none';
                //paso2.style.display = 'block';
                $scope.token = barcodeData;
            }, function(err) {
                $scope.displayMessage('Error', err);
                return false;  
            });

            //Llamar al servicio para hacer el cambio del password
        }; //End scanCode

        $scope.changePassword = function(){
            if(!AdminService.validaPassword($scope.data.password)){
                $scope.displayMessage('Error','El password no cumple con las reglas de seguridad.');
                return false;
            }
            //Muestra el spinner
            $ionicLoading.show({
                template: '<ion-spinner icon="ripple" class="spinner-calm"></ion-spinner>'
            });
            AdminService.changePassword($scope.data.email,$scope.data.password,$scope.token).then(function(response) {
                //Limpia los controles del formulario
                $scope.data.email = "";
                $timeout(function () {
                        $ionicLoading.hide();
                        $scope.displayMessage('EnRed','Su password fué actualizado correctamente.')
                        $state.go('login', {}, {reload: true});
                   }, 1000);
                        
              }, function(err) {
                $ionicLoading.hide();
                $scope.displayMessage('Error', err);      
              });
            
        }; //End changePassword

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

.controller('NewCtrl', function ($scope, $http, User, $ionicPopup, $state) {
        $scope.data = {};

        $scope.submitTicket = function () {
            var link = 'http://enreddgo.com.mx/api/newTicket.php';
            if (!IsValid()) { return false };
            var formData = {
                email: User.data.mail,
                titulo: $scope.data.titulo,
                descripcion: $scope.data.description
            };
            $http.post(link, formData).then(function (res) {
                $scope.response = res.data;

                if ($scope.response[0] == "OK") {
                    var alertPopup = $ionicPopup.alert({
                        title: 'EnRed Durango',
                        template: 'Se generó el Ticket No: ' + $scope.response[1]
                    });
                    $scope.data.titulo = "";
                    $scope.data.description = "";
                    $state.go('tab.dash');
                }
                else {
                    var alertPopup = $ionicPopup.alert({
                        title: 'Error',
                        template: $scope.response[1]
                    });
                }
            },
                function (dataErr) {
                    // Post Error
                    console.log('post error', dataErr);
                    var alertPopup = $ionicPopup.alert({
                        title: 'Error de comunicación',
                        template: 'No fue posible contactar con el servidor'
                    })
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
            }
        }

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

.controller('AccountCtrl', function ($scope, $ionicPopup, $state) {
        //$scope.settings = {
        //    enableFriends: true
        //};
        $scope.updateAccount = function () {
            var alertPopup = $ionicPopup.alert({
                title: 'Mi Cuenta',
                template: 'Sus datos se actualizaron correctamente.'
            });
        };

        $scope.logout = function () {
            //Muestra la opcion de login del menu y oculta la de logout
            var menuLogin = document.getElementById('menuLogin');
            var menuLogout = document.getElementById('menuLogout');
            var menuNewUser = document.getElementById('menuNewUser');
            var menuAdmin = document.getElementById('menuAdmin');
            var menuResetPassword = document.getElementById('menuResetPassword');
            menuLogout.style.display = 'none';
            menuLogin.style.display = 'block';
            menuNewUser.style.display = 'block';
            menuAdmin.style.display = 'none';
            menuResetPassword.style.display = 'block';
            $state.go('login');
        };
    })

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
        $scope.data.proveedorMovil = $scope.appUser["proveedorMovil"];ionic
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
