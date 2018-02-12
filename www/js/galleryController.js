angular.module('EnRed.controllers')

.controller('GalleryCtrl', function($scope, $ionicPlatform, FileService, ImageService, $cordovaActionSheet, 
    $ionicBackdrop, $ionicModal, $ionicPopup, API_ENDPOINT, $cordovaToast) {
    $scope.zoomMin = 1;    

    $ionicPlatform.ready(function() {
        $scope.images = FileService.images();
    });

    $scope.addMedia = function() {
        //Las imagenes estan limitadas a 5
        if($scope.images.length == 5){
          $cordovaToast.showLongBottom("Solo se permiten 5 imagenes por ticket").then(
            function(success) {}, function (error) {
                console.log("toast err: ", error)
            });
          
          return false;
        }

        var options = {
          title: 'Agregar imagen',
          buttonLabels: ['Fotos guardadas', 'Tomar Foto'],
          addCancelButtonWithLabel: 'Cancelar',
          androidEnableCancelButton : true,
          winphoneEnableCancelButton : true
        };
      
        document.addEventListener("deviceready", function () {
          $cordovaActionSheet.show(options)
            .then(function(btnIndex) {
                $scope.addImage(btnIndex);
            });
        }, false);
    } //End addMedia
      
    $scope.addImage = function(type) {
        ImageService.handleMediaDialog(type).then(function() {
        });        
    }//End addMedia

    $scope.urlForImage = function(imageName) {
        //Si no existe un numero de ticket la imagen se obtiene de la carpeta temporal
        //pero si ya existe el origen será el path del ticket
        //var trueOrigin = cordova.file.dataDirectory + imageName;
        var trueOrigin = '';
        if(ticket == ''){
          trueOrigin = API_ENDPOINT.tmpImgFolder + imageName;
        }
        else {
          trueOrigin = API_ENDPOINT.ticketFolder + $scope.Ticket + '/' + imageName;
        }
        return trueOrigin;
    } //end urlForImage

    $scope.showImages = function(image) {
        $scope.image = image;
        $scope.showModal('templates/gallery-zoomview.html');
    };
       
    $scope.showModal = function(templateUrl) {
        $ionicModal.fromTemplateUrl(templateUrl, {
          scope: $scope
            }).then(function(modal) {
            $scope.modal = modal;
            $scope.modal.show();
        });
    }
       
    $scope.closeModal = function() {
        $scope.modal.hide();
        $scope.modal.remove()
    };
      
    $scope.deleteImage = function(image){
        // Custom popup
        var myPopup = $ionicPopup.show({
          //template: '<input type = "text" ng-model = "data.model">',
          title: 'Borrar',
          subTitle: '¿Desea borrar la imagen seleccionada?',
          scope: $scope,
       
          buttons: [
             { text: 'Cancelar' }, {
                text: '<b>Borrar</b>',
                type: 'button-positive',
                onTap: function(e) {
                  
                  return image;
                  
                  //  if (!$scope.data.model) {
                  //     //don't allow the user to close unless he enters model...
                  //     e.preventDefault();
                  //  } else {
                  //     return $scope.data.model;
                  //  }
                }
             }
          ]
        });
    
        myPopup.then(function(image) {
          FileService.removeImage(image);
          $ionicPlatform.ready(function() {
            $scope.images = FileService.images();
            $scope.closeModal();
          });
        });    
    } //deleteImage

}) //End GalleryCtrl