import React, { useState } from 'react';
import {
  auth, 
  signInWithEmailAndPassword } from "../firebase-config";
import { 
  Text, 
  View, 
  StyleSheet,  
  TextInput,
  Button,
  ActivityIndicator,
  Alert
 } from "react-native";
import { reload } from 'firebase/auth';
import { BaseAnimationBuilder } from 'react-native-reanimated';

const Login = ({navigation}) => {

  const [email, setEmail] = useState(null);
  const [password, setPassword] = useState(null);
  const [isLoading, setIsLoading] = useState(null);
  const [connectionError, setConnectionError] = useState(null);

  const userLogin = () => {
    if (email === '' || email == null || password === '' || password == null){
      Alert.alert('Enter details to sign in!');
    } else {
      setIsLoading(true);
      signInWithEmailAndPassword(auth, email, password)
      .then((res)=>{
        console.log('User logged in successfully');
        setIsLoading(false);
        setEmail(null);
        setPassword(null);
        navigation.navigate('Dashboard')
      })
      .catch((error)=>{
        setIsLoading(false);
        setConnectionError(error.message);
        console.error(error.message);
      })
    }
  }

  if(isLoading){
    return(
      <View style={styles.preloader}>
        <ActivityIndicator size="large" color="#9E9E9E"/>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {
        connectionError && 
        <Text>{connectionError}</Text>
      }
      <TextInput
        style={styles.inputStyle}
        placeholder="Email"
        value={email}
        onChangeText={(val) => setEmail(val)}
      />
      <TextInput
        style={styles.inputStyle}
        placeholder="Password"
        value={password}
        onChangeText={(val) => setPassword(val)}
        maxLength={15}
        secureTextEntry={true}
      />   
      <Button
        color="#3740FE"
        title="Signin"
        onPress={() => userLogin()}
      />   
      <Text 
        style={styles.loginText}
        onPress={() => navigation.navigate('Signup')}>
        Don't have account? Click here to signup
      </Text>                          
    </View>
  );
 }

 const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: 35,
    backgroundColor: '#fff'
  },
  inputStyle: {
    width: '100%',
    marginBottom: 15,
    paddingBottom: 15,
    alignSelf: "center",
    borderColor: "#ccc",
    borderBottomWidth: 1
  },
  loginText: {
    color: '#3740FE',
    marginTop: 25,
    textAlign: 'center'
  },
  preloader: {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff'
  },
  errorMessage:{
    color: 'red',
    fontWeight: 'bolder'
  }
});

 export default Login;