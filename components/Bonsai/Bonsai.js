import { db, firebase } from "../../firebase-config";
import { onValue, push, remove, ref, update } from "firebase/database";
import { doc, setDoc, updateDoc } from 'firebase/firestore';

import React, { useState } from "react";
import {  
  ActivityIndicator,
  Image
} from 'react-native';
import {
  StyleSheet,
  View
} from 'react-native';
import { 
  Button, 
  Stack, 
  TextInput, 
  IconButton,
  Text
} from "@react-native-material/core";
import Icon from "@expo/vector-icons/MaterialCommunityIcons";
import * as ImagePicker from "expo-image-picker"

const Bonsai = ({bonsai: {name, description, thirsty, period, imageUrl}, id}) => {
  const [isThirsty, setIsThirsty] = useState(thirsty);
  const [waterTime, setWaterTime] = useState(3000);
  const [image, setImage] = useState(imageUrl);
  const [uploading, setUploading] = useState(false);

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

  const uploadImage = async () => {
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
          setUploading(false)
          console.log("Download URL:", url)
          console.log("id = ", id);
          let updates = {};
          updates['/bonsais/' + id] = {
            description,
            name,
            period,
            thirsty,
            imageUrl: url
          };
          update(ref(db), updates)
          .then(()=>{
            console.log('Bonsai updated.')
          })
          .catch((error)=>{
            console.log('Errror:', error);
          });
          setImage(url)
          blob.close()
          return url
        })
      }
      )
  }

  return (
    <View style={styles.bonsaiItem}>
      <Stack spacing={2} style={{margin: 16}}>
        {
          image && 
          <Image 
            source={{uri: image}} 
            style={{width: 170 , height: 200}}/>
        }
        <Text
          variant="h4"
          style={[styles.bonsaiItem,
          {opacity: isThirsty ? 0.3 : 1}]}>
          I am {name}, and I am {isThirsty ? "thirsty" : "swamped"}!
        </Text>
        <Button
          onPress={async () => {
            console.log(id);
            setIsThirsty(false);
            let updates = {};
            updates['/bonsais/' + id] = {
              description,
              name,
              period,
              thirsty: false
            };
            update(ref(db), updates)
            .then(()=>{
              console.log('Bonsai updated.')
            })
            .catch((error)=>{
              console.log('Errror:', error);
            });
            setTimeout(
              () => {
                setIsThirsty(true)
                updates['/bonsais/' + id] = {
                  description,
                  name,
                  period,
                  thirsty: true
                };
                update(ref(db), updates)
                .then(()=>{
                  console.log('Bonsai updated.')
                })
                .catch((error)=>{
                  console.log('Errror:', error);
                });
              }, waterTime
            );
          }}
          disabled={!isThirsty}
          title={isThirsty ? "Pour me some water, please!" : "Thank you!"}
        />
        <TextInput
          style = {{height: 40}}
          label = 'set a water time'
          onChangeText = { inputValue => setWaterTime(inputValue) }
          value = { period }
          leading={ props=><Icon name="clock" {...props}/> }
        />
        <View style={[styles.container, styles.upload]}>
          
          <Button title='Select Image' onPress={pickImage} />
          <Button title='Open Camera' onPress={openCamera} />
          {
            !uploading 
            ? <Button title='Upload Image' onPress={uploadImage} />
            : <ActivityIndicator size={'small'} color='black' />
          }
        </View>
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  bonsaiItem: {
    flexDirection: 'row',
    marginVertical: 10,
    alignItems: 'center',
  },
  bonsaiText: {
    paddingHorizontal: 5,
    fontSize: 16
  }
})

export default Bonsai; 