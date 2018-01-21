angular.module('starter.services', [])

.service('LoginService', function ($q) {
    return {
        loginUser: function (data, User, $http) {
            var deferred = $q.defer();
            var promise = deferred.promise;
             //Crea el JSON con el formulario
            var formData = {email : data.email, password : data.password};
            //Envia el formulario a la API
            var endpoint = 'http://enreddgo.com.mx/api/login.php';
       
            $http.post(endpoint,formData).then(
                function (response) {
                    if (response.data[0] == 'error') {
                        deferred.reject(response.data[1]);
                    }
                    else {
                        User.data.empresa = response.data[1];
                        User.data.nombre = response.data[2];
                        User.data.mail = response.data[3];
                        User.data.movil = response.data[4];
                        User.data.rol = response.data[5];
                        deferred.resolve('Welcome ' + User.data.empresa + '!');
                    };
                    
            },
            function (data) {
                // Handle error
                console.log('get error', data);
                deferred.reject('Error de login');
            });

            promise.success = function (fn) {
                promise.then(fn);
                return promise;
            }
            promise.error = function (fn) {
                promise.then(null, fn);
                return promise;
            }

            return promise;
        }
    }
})

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