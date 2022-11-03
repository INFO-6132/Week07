//https://docs.expo.dev/versions/latest/sdk/map-view/
//https://admshng.medium.com/how-to-integrate-google-maps-into-react-native-via-expo-2021-9e45f79e2f7b
//https://docs.expo.dev/versions/latest/sdk/location/
//https://github.com/react-native-maps/react-native-maps
import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, ScrollView, Image, Dimensions } from 'react-native';
import { Button, Stack, Surface } from '@react-native-material/core';
import { TextInput, Switch, Portal, Modal, Provider, ActivityIndicator, MD2Colors } from 'react-native-paper';
import { db, storage } from '../../firebase-config';
import { onValue, push, remove, ref, update, updateDoc } from 'firebase/database';
import * as ImagePicker from "expo-image-picker"
import { firebase } from '../../firebase-config';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import Bonsai from './Bonsai';
import * as Location from 'expo-location';

const dbRef = ref(db, '/bonsais');

const bonsaiModel = {
  id: null,
  name: '',
  description: '',
  period: 3000,
  thirsty: true,
  imageUrl: '',
  location: '',
}

const AddBonsai = () => {
  const [formComplete, setFormComplete] = useState(false);
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [newBonsai, setNewBonsai] = useState(bonsaiModel);
  const [dialogVisibile, setDialogVisible] = useState(false);
  const [dialogContent, setDialogContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude:currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421
      });
      setNewBonsai({...newBonsai, location: location });
    })();
      checkNewBonsai();
  }, []);

  let locationText = 'Waiting..';
  if (errorMsg) {
    locationText = errorMsg;
  } else if (location) {
    locationText = JSON.stringify(location);
  }

  const onRegionChange = (x) => {
    setLocation(x);
    setNewBonsai({...newBonsai, location: x });
    checkNewBonsai();
  }

  const checkNewBonsai = () => {return true;}

  const addNewBonsai = () => {
    console.log('adding new bonsai');
    setSaving(true);
    const newBonsaiId = push(dbRef, {
      thirsty: newBonsai.thirsty,
      period: newBonsai.period,
      name: newBonsai.name,
      description: newBonsai.description,
      imageUrl: newBonsai.imageUrl,
      location: newBonsai.location
    }).key;
    if (newBonsaiId) {
      setSaving(false);
      // Upload image
      if(image){
        uploadImage(newBonsaiId);
        console.log(newBonsaiId);
      }
      setNewBonsai({
        id: null,
        name: '',
        description: '',
        period: 3000,
        thirsty: true,
        imageUrl: '',
        location: '',
      });
    } 
  }

  const pickImage = async () => {

    console.log('pick image');

    // Ask the user for the permission to access the media library 
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      alert("You've refused to allow this appp to access your photos!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All, //specify if we want images or videos
      allowsEditing: true,
      aspect: [4,3],
      quality: 1 // 0: compress - small size / 1: compress - max quality
    });
    console.log('result from image picker', result);
    if(!result.cancelled) {
      setImage(result.uri);
      checkNewBonsai();
    }
  };

  // This function is triggered when the "Open camera" button pressed
  const openCamera = async () => {
    // Ask the user for the permission to access the camera
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      alert("You've refused to allow this appp to access your camera!");
      return;
    }

    const result = await ImagePicker.launchCameraAsync();

    // Explore the result
    console.log(result);

    if (!result.cancelled) {
      setImage(result.uri);
      console.log(result.uri);
      checkNewBonsai();
    }
  }

  const uploadImage = async (bonsaiId) => {
    console.log('uploadImage');
    const blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function () {
        resolve(xhr.response);
      };
      xhr.onerror = function () {
        reject(new TypeError('Network request failed'));
      };
      xhr.responseType = 'blob';
      xhr.open('GET', image, true);
      xhr.send(null);
    });
    const refStorage = firebase.storage().ref().child('Pictures/' + bonsaiId);
    const snapshot = refStorage.put(blob);
    snapshot.on(firebase.storage.TaskEvent.STATE_CHANGED,
      ()=>{
        setUploading(true)
      },
      (error) => {
        setUploading(false);
        console.log(error);
        blob.close();
        return;
      },
      () => {
        snapshot.snapshot.ref.getDownloadURL().then((url)=>{
          setUploading(false);
          console.log("Download URL:", url);
          console.log("id = ", bonsaiId);
          let updates = {};
          updates['/bonsais/' + bonsaiId + '/imageUrl'] = url;
          update(ref(db), updates)
          .then(()=>{
            console.log('Bonsai saved successfully')
            setNewBonsai(bonsaiModel);
            setDialogContent('Bonsai saved successfully!');
            setDialogVisible(true);
            setSaving(false);
            checkNewBonsai();         
          })
          .catch((error)=>{
            console.log('Errror on saving image:', error);
          });
          setImage(url)
          blob.close()
          return url;
        })
      }
      )
  }

  const hideDialog = () => {
    setDialogVisible(false);
  }

  return(
    <>
      {saving
        ? (<ActivityIndicator animating={true} color={MD2Colors.red800} size='large'/>)
        : 
        <Provider>
          <Portal>
            <Modal 
              visible={dialogVisibile} 
              onDismiss={hideDialog} 
              contentContainerStyle={styles.modalContainerStyke}>
                <Text>{dialogContent}</Text>
            </Modal>
          </Portal>
      <ScrollView
        styles={styles.container}
        contentContainerStyle={styles.contentContainerStyle}
      >
        
        <Stack>
          <Surface
            elevation={4}
            category="medium"
            style={
              {
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
                height: "auto",
                padding: 10
              }
            }>
              
              <TextInput
                style={{width:"100%"}}
                mode="outlined"
                label="Name"
                value={newBonsai.name}
                onChangeText={
                  text=>{
                    console.log(text);
                    setNewBonsai({...newBonsai, name: text});
                  }
                }
                />
              <TextInput
                style={{width:"100%"}}
                mode="outlined"
                label="Description"
                value={newBonsai.description}
                onChangeText={
                  text=>{
                    console.log(text);
                    setNewBonsai({...newBonsai, description: text});
                  }
                }
              />
              <View style={styles.row}>
              {
                image && 
                <Image 
                  source={{uri: image}} 
                  style={{width: 170 , height: 200}}/>
              }
                <View style={[styles.container, styles.upload]}>
              
                  <Button title='Image from Library' onPress={pickImage} />
                  <Button title='Take a picture' onPress={openCamera} />
          
                </View>
              </View>

              <View style={styles.row}>
                <View style={{width:"50%", alignContent:"center"}}>
                <Text>Is thirsty</Text>
                <Switch
                  value={newBonsai.thirsty}
                  onValueChange={
                    value=>{
                      setNewBonsai({...newBonsai, thirsty: value});
                    }
                  }/>
                </View>
                <TextInput
                  style={{width:"50%"}}
                  mode="outlined"
                  label="Period (ms)"
                  value={newBonsai.period}
                  onChangeText={
                    text=>{
                      setNewBonsai({...newBonsai, period: text});
                    }
                  }
                />
              </View>
              
              <TextInput
                style={{width:"100%"}}
                mode="outlined"
                label="Location"
                value={JSON.stringify(location)}
                />
                <View style={styles.container}>
                  <MapView 
                      style={styles.map}
                      provider={PROVIDER_GOOGLE}
                      showsUserLocation={true}
                      region={location}
                      onRegionChange={onRegionChange} />
                </View>
                  
            </Surface>
            <Button
                    title="Add new bonsai"
                    onPress={addNewBonsai}
                    color="green"
                    disabled={false}/>
        </Stack>
      </ScrollView>
    </Provider>
  }
    </>
  )
}

// React Native Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 12
  },
  contentContainerStyle: {
    padding: 12
  },
  modalContainerStyke: {
    backgroundColor: 'white',
    padding:20
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#afafaf',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginVertical: 20,
    fontSize: 20,
  },
  bonsaiItem: {
    flexDirection: 'row',
    marginVertical: 10,
    alignItems: 'center'
  },
  bonsaiText: {
    paddingHorizontal: 5,
    fontSize: 16
  },
  upload: {
    marginBottom: 5
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  map: {
    width: 300,
    height: 300,
  },
});

export default AddBonsai;