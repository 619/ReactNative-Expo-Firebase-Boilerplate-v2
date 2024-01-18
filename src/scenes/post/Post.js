import React, { useState, useEffect, useContext } from 'react'
import { Text, View, StyleSheet } from 'react-native'
import ScreenTemplate from '../../components/ScreenTemplate'
import Button from '../../components/Button'
import { useRoute, useFocusEffect, useNavigation } from '@react-navigation/native'
import { colors, fontSize } from 'theme'
import { ColorSchemeContext } from '../../context/ColorSchemeContext'
import { HomeTitleContext } from '../../context/HomeTitleContext'
import { storage } from '../../utils/Storage'
import moment from 'moment'
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase/config';
import { collection, addDoc, updateDoc, doc, getDoc } from 'firebase/firestore';
import { firestore } from '../../firebase/config';

export default function Post() {
  const route = useRoute()
  const { data, from, type, to, toName, fromName } = route.params
  const { scheme } = useContext(ColorSchemeContext)
  const [date, setDate] = useState('')
  const { setTitle } = useContext(HomeTitleContext)
  const navigation = useNavigation()
  const isDark = scheme === 'dark'
  const colorScheme = {
    content: isDark? styles.darkContent:styles.lightContent,
    text: isDark? colors.white : colors.primaryText
  }

  useEffect(() => {
    console.log('Post screen')
    loadStorage()
  }, [])

  useFocusEffect(() => {
    setTitle(data.fullName)
  });

  const loadStorage = async() => {
    try {
      const result = await storage.load({key: 'date'})
      setDate(result)
    } catch (e) {
      const result = {date: 'no data'}
      setDate(result)
    }
  }

  const saveStorage = () => {
    const today = moment().toString()
    storage.save({
      key: 'date',
      data: {
        'date': today
      }
    })
  }

  const removeStorage = () => {
    storage.remove({ key: 'date' })
  }

  const onSavePress = () => {
    saveStorage()
    loadStorage()
  }

  const onRemovePress = () => {
    removeStorage()
    loadStorage()
  }

  const onChallengePress = async () => {
    try {
      // Reference to the invites collection
      const invitesRef = collection(firestore, 'users', to, 'invites');
  
      // Add a new document with the provided data
      const docRef = await addDoc(invitesRef, {
        from,
        to,
        fromName,
        toName
      });
  
      console.log("Document written with ID: ", docRef.id);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  }

  const onAcceptPress = async () => {
    console.log('92: ', from)
    try {
      // Reference to the invites collection      
      const fromRef = doc(firestore, 'online', from)
      const fromDoc = await getDoc(fromRef)
      console.log('97: ', fromDoc.data.online)
      if (!fromDoc.exists) {
        console.log("97: fromDoc doesn't exist")
        return;
      } else if (!fromDoc.data().online) {
        console.log("100: from is not online")
        return;
      }

      const toRef = doc(firestore, 'online', to)
      const toDoc = await getDoc(toRef)
      if (!toDoc.exists) {
        console.log("107: toDoc doesn't exist")
        return;
      } else if (!toDoc.data().online) {
        console.log("110: to is not online")
        return;
      }
      
      // Add a new document with the provided data
      const gameRef = collection(firestore, 'games');
      const docRef = await addDoc(gameRef, {
        "player1": from,
        "player2": to,
        "player1Name": fromName,
        "player2Name": toName,
        "status": 1,
        "board": [null, null, null, null, null, null, null, null, null],
        "currentplayer": "player1",
        "winner": null,
        "gameOver": false
      });
      
      navigation.navigate('Tictactoe', {
        screen: 'Tictactoe',
        params: {
         id: docRef.id
        }
      })

      // navigation.navigate('Login')
 
      // console.log("124 Document written with ID: ", docRef.id);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  }

console.log('67: ', route.params)
  return (
    <ScreenTemplate>
      {
        type == "online" ? (
          <View style={[styles.container, colorScheme.content ]}>
            <Text style={[styles.field, {color: colorScheme.text}]}>Challenge this person</Text>
            <Text style={[styles.title, {color: colorScheme.text}]}>{(toName != undefined ? toName : "unknown")}</Text>
            <View style={{width:'100%'}}>
              <Button
                label='Challenge'
                color={colors.primary}
                onPress={() => onChallengePress()}
              />
            </View>
          </View>
        ) : (
          <View style={[styles.container, colorScheme.content ]}>
            <Text style={[styles.field, {color: colorScheme.text}]}>Challenge Request!</Text>
            <Text style={[styles.field, {color: colorScheme.text}]}>from</Text>
            <Text style={[styles.title, {color: colorScheme.text}]}>{fromName}</Text>
            <View style={{width:'100%'}}>
              <Button
                label='Accept'
                color={colors.primary}
                onPress={() => onAcceptPress()}
              />
            </View>
          </View>
        )
      }
      
    </ScreenTemplate>
  )
}

const styles = StyleSheet.create({
  lightContent: {
    backgroundColor: '#e6e6fa'
  },
  darkContent: {
    backgroundColor: '#696969'
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: fontSize.xxxLarge,
    marginBottom: 20,
    textAlign: 'center'
  },
  field: {
    fontSize: fontSize.middle,
    textAlign: 'center',
  },
})