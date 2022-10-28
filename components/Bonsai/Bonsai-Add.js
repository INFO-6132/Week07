//https://docs.expo.dev/versions/latest/sdk/map-view/
import React, { useState } from 'react';
import { Text, View, StyleSheet, ScrollView, Image, Dimensions } from 'react-native';
import { Button, Stack, Surface } from '@react-native-material/core';
import { TextInput, Switch, Portal, Modal, Provider, ActivityIndicator, MD2Colors } from 'react-native-paper';
import { db } from '../../firebase-config';
import { onValue, push, remove, ref, update, updateDoc } from 'firebase/database';
import * as ImagePicker from "expo-image-picker"
import { firebase } from '../../firebase-config';
import MapView from 'react-native-maps';
import Bonsai from './Bonsai';

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

  const checkNewBonsai = () => {
    setFormComplete(true);
    if(
      newBonsai.name == ''
      || newBonsai.description == ''
      || newBonsai.location == ''
      || newBonsai.period == ''
      || newBonsai.period < 1000
    ) setFormComplete(false)
  }

  const addNewBonsai = () => {
    setSaving(true);
    const newBonsaiId = push(dbRef, {
      thirsty: newBonsai.thirsty,
      period: newBonsai.period,
      name: newBonsai.name,
      description: newBonsai.description,
      imageUrl: newBonsai.imageUrl,
      location: newBonsai.location
    }).key;
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

  const pickImage = async () => {

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
    }
  }

  const uploadImage = async (bonsaiId) => {
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
    const refStorage = firebase.storage().ref().child(`Pictures/Image1`)
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
                placeholder={newBonsai.name}
                onChangeText={
                  text=>{
                    setNewBonsai({...newBonsai, name: text});
                    checkNewBonsai();
                  }
                }
                />
              <TextInput
                style={{width:"100%"}}
                mode="outlined"
                label="Description"
                placeholder={newBonsai.description}
                onChangeText={
                  text=>{
                    setNewBonsai({...newBonsai, description: text});
                    checkNewBonsai();
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
                      checkNewBonsai();
                    }
                  }
                />
              </View>
              
              <TextInput
                style={{width:"100%"}}
                mode="outlined"
                label="Location"
                value={newBonsai.location}
                onChangeText={
                  text=>{
                    setNewBonsai({...newBonsai, location: text});
                    checkNewBonsai();
                  }
                }
                />
                <View style={styles.container}>
                  <MapView style={styles.map} />
                </View>
              <View>
                <View style={{marginTop:5}}>
                  <Button
                    title="Add new bonsai"
                    onPress={addNewBonsai}
                    color="green"
                    disabled={!formComplete}/>
                </View>
              </View>
            </Surface>
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