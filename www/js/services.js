angular.module('EnRed.services', [])

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
    
    function updateUserData(nombre, email, movil, proveedorMovil){
        //Cuando el usuario actualiza sus datos, se refrescan en los valores globales
        useremail = email;
        username = nombre;
        usermovil = movil;
        userproveedorMovil = proveedorMovil;
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
      updateUserData: updateUserData,
      isAuthenticated: function() {return isAuthenticated;},
      username: function() {return username;},
      useremail: function() {return useremail;},
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
                if(err.data.msg != undefined){
                    reject(err.data.msg);
                    return false;
                }
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

    var updateUser = function(id, empresa, rol, activo, email, nombre){
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
            var formData = {'p' : 'users', 'command':'updateFromAdmin','id':id,'empresa':empresa,'rol':valRol,
            'activo':valActivo,
            'email': email,
            'nombre': nombre};
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
    };

    var validaEmail =  function validaEmail(email) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        var result = re.test(email.toLowerCase());
        return result;
    };
    
    var validaPassword = function validaPassword(password) {
        var passw = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
        var result = passw.test(password);
        return result;
    }

    var resetPassword = function(email){
        return $q(function(resolve, reject) {
            //Crea el JSON con el formulario
            var formData = {'p' : 'public', 'command':'requestPasswordChange','email':email};
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
    };

    var changePassword = function(password,token){
        return $q(function(resolve, reject) {
            //Crea el JSON con el formulario
            var formData = {'p' : 'public', 'command':'updatePassword','password':password,'token':token};
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
                if(err.data.msg != undefined){
                    reject(err.data.msg);
                }
                if(err.status == 401){ //Sesion expiró
                    reject("El código no es válido, solicite uno nuevo.");
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
        updateUser: updateUser,
        validaEmail: validaEmail,
        validaPassword: validaPassword,
        resetPassword: resetPassword,
        changePassword: changePassword
      };
}) //End AdminService
.service('UserService', function ($q, $http, API_ENDPOINT){
    var updateAccount = function(nombre, email, movil, proveedorMovil){
        return $q(function(resolve, reject) {
            //Crea el JSON con el formulario
            var formData = {'p' : 'users', 'command':'updateAccount','nombre':nombre,
             'email' : email, 'movil':movil, 'proveedorMovil':proveedorMovil};
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
                if(err.data.msg != undefined){
                    reject(err.data.msg);
                    return false;
                }
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
    } //End updateAccount

    return {
        updateAccount: updateAccount
      };
}) //End UserService
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

.factory('Tickets', function($q, $http, AuthService, API_ENDPOINT ) {
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

    addTicket = function(titulo,descripcion,images,lat,lon) {
        var email = AuthService.useremail();
        var nombre = AuthService.username();

        return $q(function(resolve, reject) {
            //Crea el JSON con el formulario
            var formData = {'p' : 'tickets', 'command':'add',
             'email' : email, 'titulo':titulo, 'nombre':nombre,'descripcion':descripcion, 'imagenes':images,
             'lat':lat, 'long':lon};
            $http.post(API_ENDPOINT.url,formData).then(
                function (response) {
                    console.log("response: " + response.data);
                    if (!response.data.success) {
                        reject(response.data.msg);
                    }
                    else {
                        resolve(response.data.msg);
                    }
            },
            function (err) {
                if(err.data != undefined){
                    reject(err.data);
                    return false;
                }
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
    } //addTicket
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
        },
        submitTicket: addTicket
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
})

.factory('FileService', function(API_ENDPOINT, $http) {
    var images;
    var ticketData;
    var IMAGE_STORAGE_KEY = 'images';
    var TICKET_STORAGE_KEY = 'ticket';

    function getLocalTicket(){
        var storedTicket = window.localStorage.getItem(TICKET_STORAGE_KEY);
        if (storedTicket) {
            ticketData = JSON.parse(storedTicket)
        }
        else {
            ticketData = [];
        }
        return ticketData;
    }

    function saveLocalTicket(titulo,desc,lat,long){
        var storedTicket = { 'tit':titulo,
            'desc':desc,
            'lat':lat,
            'lon': long 
        };
        window.localStorage.setItem(TICKET_STORAGE_KEY, JSON.stringify(storedTicket));
    }

    function getImages() {
      var img = window.localStorage.getItem(IMAGE_STORAGE_KEY);
      if (img) {
        images = JSON.parse(img);
      } else {
        images = [];
      }
      return images;
    };
   
    function addImage(img) {
      images.push(img);
      window.localStorage.setItem(IMAGE_STORAGE_KEY, JSON.stringify(images));
    };
   
  
    function removeImage(img) {
      //Borra la imagen en el servidor
      //TODO incluir en el comando el no. de ticket si existe
      var data = {'command':'removeImage', 'image':img};
      $http.post(API_ENDPOINT.cleaner,data).then(
        function (result) {
            console.log(JSON.stringify(result.data));
            //Si se eliminó del servidor la elimina del dispositivo
            for(i=0;i<images.length;i++){
              if(images[i] == img){
                images.splice(i, 1);
                console.log("Se borro del dispositivo");
                break;
              }
            };
            window.localStorage.removeItem(IMAGE_STORAGE_KEY);
            window.localStorage.setItem(IMAGE_STORAGE_KEY, JSON.stringify(images));
        },
        function (err) {
          console.log(JSON.stringify(err));
        });
    };
  
    function cleanImages(){
        for(i=0; i<images.length; i++){
            var data = {'command':'removeImage', 'image':images[i]};
            $http.post(API_ENDPOINT.cleaner,data).then(
                function (result) {
                    console.log(JSON.stringify(result.data));
                },
                function (err) {
                console.log(JSON.stringify(err));
                });
        }
        images.length = 0;
        window.localStorage.removeItem(IMAGE_STORAGE_KEY);
        window.localStorage.setItem(IMAGE_STORAGE_KEY, JSON.stringify(images));
        //Tambien elimina la info local del ticket
        ticketData.lenght = 0;
        window.localStorage.setItem(TICKET_STORAGE_KEY, JSON.stringify(ticketData));
    } //removeAllImages

    return {
      storeImage: addImage,
      images: getImages,
      removeImage: removeImage,
      removeAllImages: cleanImages,
      getStoredTicket: getLocalTicket,
      storeTicket: saveLocalTicket
    }
  })

  .factory('ImageService', function($cordovaCamera, FileService, $q, $cordovaFile, $cordovaFileTransfer, API_ENDPOINT, $timeout) {
    function makeid() {
        var text = '';
        var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
     
        for (var i = 0; i < 5; i++) {
          text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
      };
     
      function optionsForType(type) {
        var source;
        switch (type) {
          case 0:
            source = Camera.PictureSourceType.CAMERA;
            break;
          case 1:
            source = Camera.PictureSourceType.PHOTOLIBRARY;
            break;
        }
        return {
          destinationType: Camera.DestinationType.FILE_URI,
          sourceType: source,
          allowEdit: false,
          targetWidth: 500,
          encodingType: Camera.EncodingType.JPEG,
          popoverOptions: CameraPopoverOptions,
          saveToPhotoAlbum: false,
          correctOrientation: true
        };
      }
     
      function saveMedia(type) {
        return $q(function(resolve, reject) {
          var options = optionsForType(type);
     
          $cordovaCamera.getPicture(options).then(function(imageUrl) {
              if(ionic.Platform.isAndroid() && type === 1){
                  window.resolveLocalFileSystemURL(imageUrl, function(fileEntry){
                     imageUrl = fileEntry.nativeURL;
                  });
                }
            var name = imageUrl.substr(imageUrl.lastIndexOf('/') + 1);
            var namePath = imageUrl.substr(0, imageUrl.lastIndexOf('/') + 1);
            var newName = makeid() + name;
            if(name.indexOf('?') != -1) {
              name = name.substr(0, name.lastIndexOf('?'));
              newName = makeid() + name;
              }
            //Sube la imagen a la carpeta temporan en el servidor
            //Define las opciones a pasar al servidor
            var options = {
              fileKey: "file",
              fileName: name,
              chunkedMode: false,
              mimeType: "multipart/form-data",
              params : {'command':'saveTemp'}
            };
            $cordovaFileTransfer.upload(API_ENDPOINT.uploader, imageUrl, options)
             .then(function(result) {
              //Guarda el nombre de la imagen en el array
              FileService.storeImage(name);
              //console.log("SUCCESS: " + JSON.stringify(result.response));
             }, function(err) {
               console.log("Error: " + JSON.stringify(err));
             }, function (progress) {
               // constant progress updates
             });
          });
        })
      }
      return {
        handleMediaDialog: saveMedia
      }
    })