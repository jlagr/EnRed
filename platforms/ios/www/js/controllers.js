angular.module('starter.controllers', [])

    /*   -----------   Menú lateral  --------------- */
    .controller('LoginCtrl', function ($scope, $ionicLoading, $cordovaSQLite, $timeout, $http, LoginService, $ionicPopup, $state, User) {
        $scope.data = {};
        //Si hay un mail guardado en la bd local lo usa como default
        var storedMail = storedMail();
        if (storedMail != "") {
            $scope.data.email = storedMail;
            if(testMode) {
                $scope.data.password = "Ocampo1318";
            }
        }

        $scope.login = function () {
            if (!isValid()) {
                return false;
            }
            //Muestra el spinner
            $ionicLoading.show({
                template: '<ion-spinner icon="ripple" class="spinner-calm"></ion-spinner>'
            });

            //Llama al servicio de Login
            LoginService.loginUser($scope.data, User, $http).success(function (data) {
                //Oculta la opcion de login del menú y muestra la de logout
                var menuLogin = document.getElementById('menuLogin');
                var menuLogout = document.getElementById('menuLogout');
                var menuNewUser = document.getElementById('menuNewUser');
                var menuAdmin = document.getElementById('menuAdmin');
                var menuAdmin = document.getElementById('menuAdmin');
                var menuResetPassword = document.getElementById('menuResetPassword');
                menuLogin.style.display = 'none';
                menuLogout.style.display = 'block';
                menuResetPassword.style.display = 'none';
                if (User.data.rol == "admin") {
                    menuNewUser.style.display = 'none';
                    menuAdmin.style.display = 'block';
                }
                if (User.data.rol == "worker") {
                    menuNewUser.style.display = 'none';
                    menuAdmin.style.display = 'none';
                }
                //Inserta un retardo antes de cambiar de estado
                $timeout(function () {
                    $ionicLoading.hide();
                    $scope.data.password = "";
                    $state.go('tab.dash');
                }, 1000);

            }).error(function (data) {
                $timeout(function () {
                    $ionicLoading.hide();
                    alertPopup = $ionicPopup.alert({
                        title: 'Error de Login',
                        template: data
                    })
                }, 1000);
            });
        };

        $scope.newUser = function () {
            $state.go('newUser');
        };

        $scope.resetPassword = function () {
            $state.go('passwordReset');
        };

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
        };

        function validaEmail(email) {
            var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            var result = re.test(email.toLowerCase());
            return result;
        };

        function storedMail() {
            var query = "SELECT email FROM user ORDER BY email ASC LIMIT 1";
            /*$cordovaSQLite.execute(db, query).then(function(res) {
                console.log("insertId: " + res.insertId);
                return "ok@outlook.com";
              }, function (err) {
                console.error(err);
                return "error";
              });*/
            if (testMode) {
                return "jlagr@outlook.com"
            }
            return "";
        };
    })

    .controller('NewUserCtrl', function ($scope, $ionicLoading, $timeout, $http, LoginService, $ionicPopup, $state) {
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

            //Crea el JSON con el formulario
            var formData = {
                command: "new",
                nombre: $scope.data.nombre,
                email: $scope.data.email,
                movil: $scope.data.movil,
                proveedorMovil: $scope.data.proveedorMovil,
                password: $scope.data.password
            };
            //Envia el formulario a la API
            var link = 'http://enreddgo.com.mx/api/users.php';

            $http.post(link, formData).then(function (res) {
                $scope.response = res.data;
                console.log($scope.response);

                if ($scope.response[0] == "OK") {
                    $scope.data.nombre = "";
                    $scope.data.email = "";
                    $scope.data.movil = "";
                    $scope.data.proveedorMovil = "Telcel";
                    $scope.data.password = "";
                    $timeout(function () {
                        $ionicLoading.hide();
                        $ionicPopup.alert({
                            title: 'Solicitud Enviada',
                            template: 'Recibirá un correo cuando el administrador autorice su usuario.'
                        })
                        $state.go('login');
                    }, 1000);
                }
                else {
                    $timeout(function () {
                        $ionicLoading.hide();
                        $ionicPopup.alert({
                            title: 'Error',
                            template: $scope.response[1]
                        });
                    }, 1000);
                }
            },
                function (dataErr) {
                    // Post Error
                    console.log('post error', dataErr);
                    $ionicLoading.hide();
                    var alertPopup = $ionicPopup.alert({
                        title: 'Error de comunicación',
                        template: 'No fue posible contactar con el servidor'
                    });
                });

        }; //End newUser

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
            else if (!validaEmail($scope.data.email)) {
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
            else if (!validaPassword($scope.data.password)) {
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

        function validaEmail(email) {
            var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            var result = re.test(email.toLowerCase());
            return result;
        };

        function validaPassword(password) {
            var passw = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
            var result = passw.test(password);
            return result;
        }

    })

    .controller('ResetPasswordCtrl', function ($scope, LoginService, $ionicPopup, $state) {

    })

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

    .controller('AccountCtrl', function ($scope, LoginService, $ionicPopup, $state) {
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
    .controller('AdminUsersCtrl', function ($scope, $ionicLoading, $timeout, $http, $ionicPopup, $cordovaToast) {
        $scope.appUsers = {};
        $scope.data = {};
        $scope.appAllUsers = {};

        $ionicLoading.show({
            template: '<ion-spinner icon="ripple" class="spinner-calm"></ion-spinner>'
        });

        var formData = {command : 'getAll'};
        var endpoint = 'http://enreddgo.com.mx/api/users.php';
        
        loadAll = function() {
            $http.post(endpoint, formData).then(function (res) {
                console.log("Server: ",res.data);
                if (res.data[0] == "Respuesta del Servidor") {
                    $timeout(function () {
                        $ionicLoading.hide();
                        alertPopup = $ionicPopup.alert({
                            title: 'Error',
                            template: data
                        })
                    }, 1000);    
                }
                else {
                    $scope.appAllUsers = res.data;
                    $scope.appUsers = $scope.appAllUsers;
                }
            },
            function (dataErr) {
                // Post Error
                console.log('post error', dataErr);
                $timeout(function () {
                        $ionicLoading.hide();
                        alertPopup = $ionicPopup.alert({
                            title: 'Error',
                            template: 'El servicio no responde.'
                        })
                    }, 1000); /*
                $cordovaToast.showLongBottom('El servicio no responde.').then(function(success) {
                        console.log("toast ok");
                    }, function (error) {
                        console.log("toast err: ", error)
                    });*/
            });
            $ionicLoading.hide();    
        };

        loadAll();
        
        $scope.test = function (){
            console.log("refresing");
            $timeout(function () {
                loadAll();
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

    .controller('AdminUsersDetailCtrl', function () {

    })

    .controller('AdminNotificationsCtrl', function () {

    })

    .controller('AdminNotificationDetailCtrl', function () {

    })