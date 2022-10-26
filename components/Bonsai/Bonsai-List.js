import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  ScrollView
} from "react-native";
import {
  Button,
  Stack,
  TextInput,
  Surface
} from '@react-native-material/core';
import { db } from '../../firebase-config';
import { onValue, push, remove, ref } from 'firebase/database';
import Bonsai from './Bonsai';
import { QuerySnapshot } from "firebase/firestore";

const dbRef = ref(db, '/bonsais');

const BonsaiList = () => {
  const [bonsais, setBonsais] = useState({});
  const [currentBonsai, setCurrentBonsai] = useState(
    {
      name: '',
      description: '',
      thirsty: true,
      period: 3000,
    });
    const bonsaiKeys = Object.keys(bonsais);

    useEffect(
      () => {
        return onValue(dbRef, querySnapshot => {
          let data = querySnapshot.val() || {};
          let bonsais = {...data};
          console.log('bonsais', bonsais);
          setBonsais(bonsais);
        });
      }, []);

    const addNewBonsai = () => {
      console.log('currentBonsai', currentBonsai);
      push(dbRef, {
        thirsty: currentBonsai.thirsty,
        period: currentBonsai.period,
        name: currentBonsais.name,
        description: currentBonsai.description
      });
    }

    const clearBonsais = () => {
      remove(dbRef);
    }

    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainerStyle}
      >
        <Stack m={4} spacing={2} divider={true}>
          <View>
            {
              bonsaiKeys.length > 0
              ? (bonsaiKeys.map(key => (
                <Bonsai
                  key={key}
                  id={key}
                  bonsai={bonsais[key]}
                />
              )))
              : (<Text>No bonsais</Text>)
            }
          </View>
        </Stack>
      </ScrollView>
    );
}

// React Native Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 12
  },
  contentContainerStyle: {
    padding: 24
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
  }
});

export default BonsaiList;