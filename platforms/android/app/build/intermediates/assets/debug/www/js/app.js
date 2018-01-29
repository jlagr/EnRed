// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
var db = null;
var testMode = false;

angular.module('EnRed', ['ionic','ngCordova', 'EnRed.controllers', 'EnRed.services'])

.run(function($ionicPlatform, $cordovaSQLite) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
      if (cordova.platformId === "ios" && window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
    
    //Crea la base de datos local y una tabla para guardar el email
    /*function openDB(){
      if(db == null)
      {
        if(cordova.platformId === "ios"){
          // Works on iOS 
          db = window.sqlitePlugin.openDatabase({ name: "EnRedDb.db", location: 2, createFromLocation: 1});  
        } else{
          // Works on android but not in iOS
          db = $cordovaSQLite.openDB({ name: "EnRedDb.db", iosDatabaseLocation:'default'});
        }
      }
    }
    openDB();
    $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS user (id integer primary key, email text)");
    */
    if (window.Connection) {
        if (navigator.connection.type == Connection.NONE) {
            alert('No hay conexi�n a internet');
        }
        else {
            alert('Conectado');
        }
    }

  });
})

.config(function($stateProvider, $urlRouterProvider, USER_ROLES) {
  $stateProvider
    .state('login', {
        url: '/login',
        templateUrl: 'templates/login.html',
        controller: 'LoginCtrl'
    })

    .state('newUser', {
        url: '/newUser',
        templateUrl: 'templates/newUser.html',
        controller: 'NewUserCtrl',
        data: { authorizedRoles: [USER_ROLES.public]}
    })

    .state('passwordReset', {
        url: '/passwordReset',
        templateUrl: 'templates/resetPassword.html',
        controller: 'ResetPasswordCtrl',
        data: { authorizedRoles: [USER_ROLES.public]}
    })

  // setup an abstract state for the tabs directive
    .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html'
  })

  .state('tab.dash', {
    url: '/dash',
    views: {
      'tab-dash': {
        templateUrl: 'templates/tab-dash.html',
        controller: 'DashCtrl'
      }
    }
  })
    .state('tab.ticket-detail', {
        url: '/dash/:ticketId',
        views: {
            'tab-dash': {
                templateUrl: 'templates/ticket-detail.html',
                controller: 'TicketDetailCtrl'
            }
        }
    })

  .state('tab.new', {
      url: '/new',
      views: {
          'tab-new': {
              templateUrl: 'templates/tab-new.html',
              controller: 'NewCtrl'
          }
      }
  })
      
  .state('tab.notifications', {
      url: '/notifications',
      views: {
        'tab-notifications': {
          templateUrl: 'templates/tab-notifications.html',
          controller: 'NotificationsCtrl'
        }
      }
    })
    .state('tab.not-detail', {
      url: '/notifications/:Id',
      views: {
          'tab-notifications': {
          templateUrl: 'templates/notification-detail.html',
          controller: 'NotificationDetailCtrl'
        }
      }
    })

  .state('tab.account', {
    url: '/account',
    views: {
      'tab-account': {
        templateUrl: 'templates/tab-account.html',
        controller: 'AccountCtrl'
      }
    }
  })

   // setup an abstract state for the tabs directive
   .state('admin', {
    url: '/admin',
    abstract: true,
    templateUrl: 'templates/admin.html'
  })

  .state('admin.users', {
    url: '/adminUsers',
    views: {
      'admin-users': {
        templateUrl: 'templates/admin-users.html',
        controller: 'AdminUsersCtrl'
      }
    },
    data: {
      authorizedRoles: [USER_ROLES.admin]
    }
  })
    .state('admin.users-detail', {
        url: '/adminUsers/:id',
        views: {
            'admin-users': {
                templateUrl: 'templates/AdminUsers-detail.html',
                controller: 'AdminUsersDetailCtrl'
            }
        }
    })

  .state('admin.notifications', {
      url: '/notifications',
      views: {
        'admin-notifications': {
          templateUrl: 'templates/admin-notifications.html',
          controller: 'AdminNotificationsCtrl'
        }
      }
    })
    .state('admin.not-detail', {
      url: '/notifications/:Id',
      views: {
          'admin-notifications': {
          templateUrl: 'templates/AdminNotification-detail.html',
          controller: 'AdminNotificationDetailCtrl'
        }
      }
    })  

  // if none of the above states are matched, use this as the fallback
  //$urlRouterProvider.otherwise('/login');
  $urlRouterProvider.otherwise(function ($injector, $location) {
    var $state = $injector.get("$state");
    $state.go("login");
  });
})

.run(function ($rootScope, $state, AuthService, AUTH_EVENTS) {
  $rootScope.$on('$stateChangeStart', function (event,next, nextParams, fromState) {

    if ('data' in next && 'authorizedRoles' in next.data) {
      var authorizedRoles = next.data.authorizedRoles;
      if(authorizedRoles.includes('public')){
        return false;
      }
      if (!AuthService.isAuthorized(authorizedRoles)) {
        event.preventDefault();
        $state.go($state.current, {}, {reload: true});
        $rootScope.$broadcast(AUTH_EVENTS.notAuthorized);
      }
    }

    if (!AuthService.isAuthenticated()) {
      if (next.name !== 'login') {
        event.preventDefault();
        $state.go('login');
      }
    }
  });
})