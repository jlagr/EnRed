angular.module('starter.services', [])

.service('AuthService', function($q, $http, USER_ROLES, API_ENDPOINT) {
    var LOCAL_TOKEN_KEY = 'EnRedToken';
    var LOCAL_USER_EMAIL = 'EnRedUserEmail';
    var useremail = '';
    var username = '';
    var userempresa = '';
    var usermovil = '';
    var userproveedorMovil = '';
    var isAuthenticated = false;
    var role = '';
    var authToken;
  
    function loadUserCredentials() {
      var token = window.localStorage.getItem(LOCAL_TOKEN_KEY);
      if (token) {
        useCredentials(token);
      }
    }
  
    function storeUserCredentials(data, token) {
      window.localStorage.setItem(LOCAL_TOKEN_KEY, token);
      if(data != undefined){
        window.localStorage.setItem(LOCAL_USER_EMAIL, data.email)
      }
      
      useCredentials(data, token);
    }
  
    function useCredentials(data, token) {
      isAuthenticated = true;
      authToken = token;
    
      useremail = data.email;
      username = data.nombre;
      userempresa = data.empresa;
      usermovil = data.movil;
      userproveedorMovil = data.proveedorMovil;

      if (data.rol == 'admin') {
        role = USER_ROLES.admin
      }
      if (data.rol == 'worker') {
        role = USER_ROLES.worker
      }
      if (data.rol == 'user') {
        role = USER_ROLES.user
      }
  
      // Set the token as header for all requests
      $http.defaults.headers.common['X-Auth-Token'] = token;
    }
  
    function destroyUserCredentials() {
      authToken = undefined;
      username = '';
      useremail = '';
      usermovil = '';
      userproveedorMovil = '';
      userempresa = '';
      isAuthenticated = false;
      $http.defaults.headers.common['X-Auth-Token'] = undefined;
      window.localStorage.removeItem(LOCAL_TOKEN_KEY);
    }
  
    var register = function(user) {
        return $q(function(resolve, reject) {
          $http.post(API_ENDPOINT.url + '/signup', user).then(function(result) {
            if (result.data.success) {
              resolve(result.data.msg);
            } else {
              reject(result.data.msg);
            }
          });
        });
      };
  
    var login = function(email, pw) {
      return $q(function(resolve, reject) {
        //Crea el JSON con el formulario
        var formData = {'p' : 'login', 'email' : email, 'password' : pw};
        $http.post(API_ENDPOINT.url,formData).then(
            function (response) {
                //console.log(response);
                if (!response.data.success) {
                    reject(response.data.msg);
                }
                else {
                    storeUserCredentials(response.data.data, response.data.token);
                    resolve(true);
                };
                
        },
        function (err) {
            console.error(err.data.msg);
            reject(err.data.msg);
        });
      });
    };
  
    var logout = function() {
      destroyUserCredentials();
    };
  
    var isAuthorized = function(authorizedRoles) {
      if (!angular.isArray(authorizedRoles)) {
        authorizedRoles = [authorizedRoles];
      }
      return (isAuthenticated && authorizedRoles.indexOf(role) !== -1);
    };
  
    loadUserCredentials();
  
    return {
      login: login,
      logout: logout,
      isAuthorized: isAuthorized,
      isAuthenticated: function() {return isAuthenticated;},
      username: function() {return username;},
      role: function() {return role;},
      userempresa: function() {return userempresa;},
      usermovil: function() {return usermovil;},
      userproveedorMovil: function() {return userproveedorMovil;}
    };
  })

.service('AdminService', function ($q, $http, API_ENDPOINT, AuthService, $state) {
    
    var loadAllUsers = function() {
        return $q(function(resolve, reject) {
          //Crea el JSON con el formulario
          var formData = {'p' : 'users', 'command' : 'getAll'};
          $http.post(API_ENDPOINT.url,formData).then(
              function (response) {
                  if (!response.data.success) {
                      reject(response.data.msg);
                  }
                  else {
                      resolve(response.data.result);
                  };
                  
          },
          function (err) {
              if(err.status == 401){ //Sesion expiró
                AuthService.logout();
                $state.go('login');
                reject("Su sesión ha caducado.");HTMLQuoteElement
                }
                else{
                    reject(err.data.msg);
                }
          });
        });
      };

    var addUser = function (nombre,email,movil,proveedorMovil,pw){
        return $q(function(resolve, reject) {
            //Crea el JSON con el formulario
            var formData = {'p' : 'public', 'command':'add','nombre':nombre,
             'email' : email, 'movil':movil, 'proveedorMovil':proveedorMovil, 'password' : pw};
            $http.post(API_ENDPOINT.url,formData).then(
                function (response) {
                    //console.log(response);
                    if (!response.data.success) {
                        reject(response.data.msg);
                    }
                    else {
                        resolve(true);
                    }
            },
            function (err) {
                if(err.status == 401){ //Sesion expiró
                    AuthService.logout();
                    $state.go('login');
                    reject("Su sesión ha caducado.");
                }
                else{
                    reject(err.data.msg);
                }
            });
        });
    }

    var getAppUser = function(userId) {
        return $q(function(resolve, reject) {
            //Crea el JSON con el formulario
            var formData = {'p' : 'users', 'command':'getUser', 'id':userId};
            $http.post(API_ENDPOINT.url,formData).then(
                function (response) {
                    //console.log(response);
                    if (!response.data.success) {
                        reject(response.data.msg);
                    }
                    else {
                        resolve(response.data.result);
                    }
            },
            function (err) {
                if(err.status == 401){ //Sesion expiró
                    AuthService.logout();
                    $state.go('login');
                    reject("Su sesión ha caducado.");
                }
                else{
                    reject(err.data.msg);
                }
            });
        });
    }

    var getEmpresas = function() {
        return $q(function(resolve, reject) {
            //Crea el JSON con el formulario
            var formData = {'p' : 'users', 'command':'getEmpresas'};
            $http.post(API_ENDPOINT.url,formData).then(
                function (response) {
                    if (!response.data.success) {
                        reject(response.data.msg);
                    }
                    else {
                        resolve(response.data.result);
                    }
            },
            function (err) {
                if(err.status == 401){ //Sesion expiró
                    AuthService.logout();
                    $state.go('login');
                    reject("Su sesión ha caducado.");
                }
                else{
                    reject(err.data.msg);
                }
            });
        });
    }

    var updateUser = function(id, empresa, rol, activo){
        var valRol = 3;
        var valActivo = 0;
        return $q(function(resolve, reject) {
            //Crea el JSON con el formulario
            switch (rol){
                case "Administrador": valRol = 1; break;
                case "Trabajador": valRol = 2; break;
            }
            if(activo){
                valActivo = 1;
            }
            var formData = {'p' : 'users', 'command':'updateFromAdmin','id':id,'empresa':empresa,'rol':valRol,'activo':valActivo};
            $http.post(API_ENDPOINT.url,formData).then(
                function (response) {
                    if (!response.data.success) {
                        reject(false);
                    }
                    else {
                        resolve(true);
                    }
            },
            function (err) {
                if(err.status == 401){ //Sesion expiró
                    AuthService.logout();
                    $state.go('login');
                    reject("Su sesión ha caducado.");
                }
                else{
                    reject(err.data);
                }
            });
        });
    }

    return {
        loadAllUsers: loadAllUsers,
        addUser: addUser,
        getAppUser: getAppUser,
        getEmpresas: getEmpresas,
        updateUser: updateUser
      };
}) //End AdminService

.service('MsgService', function () {
    return {
        all: function ($http) {
            //var deferred = $q.defer();
            //var promise = deferred.promise;
            var mensajes = [];

            var endpoint = 'http://enreddgo.com.mx/api/notificaciones.php';
            $http.get(endpoint).then(
                function (response) {
                    console.log('get', response);
                    if (response.data[0] === 'error') {
                        //User.message = response.data[1];
                        //deferred.reject(response.data[1]);
                    }
                    else {
                        //Mensajes = response.data;
                        mensajes = response.data;
                        //deferred.resolve(response.data);
                    };

                },
            function (data) {
                // Handle error
                console.log('get error', data);
                //deferred.reject('Error de login');
            })

            //promise.success = function (fn) {
            //    promise.then(fn);
            //    return promise;
            //}
            //promise.error = function (fn) {
            //    promise.then(null, fn);
            //    return promise;
            //}

            return mensajes;
        }
    }
})

.factory('testFac', function ($http) {
    var endpoint = 'http://enreddgo.com.mx/api/notificaciones.php';
    return {
        all: function() {$http.get(endpoint)}
    }
})

.factory('Tickets', function() {
    // Some fake testing data
    var tickets = [{
        id: 1,
        titulo: 'Cable desconectado',
        fecha: '01/Ene/2018',
        reporto: 'jlagr',
        estatus: 'abierto',
        update: '01/Ene/2018',
        descripcion: 'Esta es la descripción detallada del problema',
        comentarios: 'Aquí van los comentarios de quien atendió el ticket'
    }, {
        id: 2,
        titulo: 'Poste caido',
        fecha: '05/Ene/2018',
        reporto: 'Juan Pérez',
        estatus: 'En Proceso',
        update: '06/Ene/2018',
        descripcion: 'Esta es la descripción detallada del problema',
        comentarios: 'Aquí van los comentarios de quien atendió el ticket'
    }, {
        id: 3,
        titulo: 'No responde el enlace',
        fecha: '06/Ene/2018',
        reporto: 'Agustín González',
        estatus: 'Cerrado',
        update: '08/Ene/2018',
        descripcion: 'Esta es la descripción detallada del problema',
        comentarios: 'Aquí van los comentarios de quien atendió el ticket'
    }, {
        id: 4,
        titulo: 'Reporte de prueba',
        fecha: '10/Ene/2018',
        reporto: 'Javier Ramírez',
        estatus: 'abierto',
        update: '10/Ene/2018',
        descripcion: 'Esta es la descripción detallada del problema',
        comentarios: 'Aquí van los comentarios de quien atendió el ticket'
    }, {
        id: 5,
        titulo: 'No tengo nada que hacer',
        fecha: '01/Febrero/2018',
        reporto: 'Daniel López',
        estatus: 'abierto',
        update: '01/Feb/2018',
        descripcion: 'Esta es la descripción detallada del problema',
        comentarios: 'Aquí van los comentarios de quien atendió el ticket'
    }];

    return {
        all: function() {
            return tickets;
        },
        get: function (ticketId) {
            for (var i = 0; i < tickets.length; i++) {
                if (tickets[i].id === parseInt(ticketId)) {
                    return tickets[i];
                }
            }
            return null;
        }
    };
})

.factory('User', function () {
    return {
        data: {
            empresa: '',
            nombre: '',
            mail: '',
            movil: '',
            rol: ''
        }
    }
})

.factory('appUsers', function(){
    var appUser = [{
        id: 1,
        nombre: 'Usuario1',
        email: 'usuario1@enreddgo.com.mx',
        empresa: 'Una Empresa',
        movil: '6188253763',
        proveedorMovil: 'AT&T',
        rol: 'worker',
        activo: '0'
    }, {
        id: 2,
        nombre: 'Usuario2',
        email: 'usuario2@enreddgo.com.mx',
        empresa: 'Otra Empresa',
        movil: '3332014498',
        proveedorMovil: 'Telcel',
        rol: 'user',
        activo: '1'
    }, {
        id: 3,
        nombre: 'Usuario3',
        email: 'usuario3@enreddgo.com.mx',
        empresa: 'Mas Empresas',
        movil: '3332409877',
        proveedorMovil: 'Otro',
        rol: 'admin',
        activo: '0'
    }];

    return {
        all: function() {
            return appUser;
        },
        get: function (Id) {
            for (var i = 0; i < appUser.length; i++) {
                if (appUser[i].id === parseInt(Id)) {
                    return appUser[i];
                }
            }
            return null;
        }
    };
})

.factory('Mensajes', function () {
    var mensajes = [{
        id: 1,
        titulo: 'Titulo del primer mensaje',
        mensaje: 'Primer mensaje de prueba',
        url: 'google.com',
        fecha: '01/Ene/2018'
    }, {
        id: 2,
        titulo: 'Segundo mensaje',
        mensaje: 'Este es el texto del segundo mensaje',
        url: '',
        fecha: '01/Ene/2018'
    }, {
        id: 3,
        titulo: 'Invitación',
        mensaje: 'Visita nuestro sitio web en',
        url: 'enreddgo.com.mx',
        fecha: '01/Ene/2018'
    }];

    return {
        all: function () {
            return mensajes;
        },
        remove: function (mensaje) {
            chats.splice(chats.indexOf(mensaje), 1);
        },
        get: function (mensajeId) {
            for (var i = 0; i < mensajes.length; i++) {
                if (mensajes[i].id === parseInt(mensajeId)) {
                    return mensajes[i];
                }
            }
            return null;
        }
    };
})

.factory('Chats', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var chats = [{
    id: 0,
    name: 'Ben Sparrow',
    lastText: 'You on your way?',
    face: 'img/ben.png'
  }, {
    id: 1,
    name: 'Max Lynx',
    lastText: 'Hey, it\'s me',
    face: 'img/max.png'
  }, {
    id: 2,
    name: 'Adam Bradleyson',
    lastText: 'I should buy a boat',
    face: 'img/adam.jpg'
  }, {
    id: 3,
    name: 'Perry Governor',
    lastText: 'Look at my mukluks!',
    face: 'img/perry.png'
  }, {
    id: 4,
    name: 'Mike Harrington',
    lastText: 'This is wicked good ice cream.',
    face: 'img/mike.png'
  }];

  return {
    all: function() {
      return chats;
    },
    remove: function(chat) {
      chats.splice(chats.indexOf(chat), 1);
    },
    get: function(chatId) {
      for (var i = 0; i < chats.length; i++) {
        if (chats[i].id === parseInt(chatId)) {
          return chats[i];
        }
      }
      return null;
    }
  };
});
