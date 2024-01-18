import React, { useEffect, useContext, useState } from 'react'
import { Text, View, StyleSheet, ScrollView } from 'react-native'
import ScreenTemplate from '../../components/ScreenTemplate'
import Button from '../../components/Button'
import { colors, fontSize } from 'theme'
import { ColorSchemeContext } from '../../context/ColorSchemeContext'
import { UserDataContext } from '../../context/UserDataContext'
import { useNavigation } from '@react-navigation/native'
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase/config';
import { collection, onSnapshot, doc } from 'firebase/firestore';
import { firestore } from '../../firebase/config';

export default function Follow() {
  const navigation = useNavigation()
  const { userData } = useContext(UserDataContext)
  const { scheme } = useContext(ColorSchemeContext)
  const [invitesData, setInvitesData] = useState([]);
  const isDark = scheme === 'dark'
  const colorScheme = {
    text: isDark? colors.white : colors.primaryText
  }
  console.log('before 23')
  const userOnlineRef = doc(firestore, 'online', userData.id); // Reference to the user's online document
  console.log('after 25')
  useEffect(() => {

    const addStatus = async () => {
      console.log('before 29')
      await setDoc(userOnlineRef, { email: userData.email, id: userData.id, online: true, inGame: false }, { merge: true });
      console.log('after 30')
    }
    addStatus()
    console.log('Follow screen')
    // onAuthStateChanged(auth, (user) => {
    //   if (user) {
    //     const usersRef = doc(firestore, 'users', user.uid)
    //     onSnapshot(usersRef, (querySnapshot) => {
    //       const userData = querySnapshot.data()
    //       setUserData(userData)
    //       setLoggedIn(true)
    //       setChecked(true)
    //     })
    //   } else {
    //     setLoggedIn(false)
    //     setChecked(true)
    //   }
    // });
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // Reference to the 'invites' subcollection inside the user's document
        const invitesRef = collection(firestore, 'users', user.uid, 'invites');
    
        // Listen for changes in the 'invites' subcollection
        onSnapshot(invitesRef, (querySnapshot) => {
          const invitesData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setInvitesData(invitesData); // Assuming you have a state setter for invites data
          // setLoggedIn(true);
          // setChecked(true);
        });
      } else {
        // setLoggedIn(false);
        // setChecked(true);
      }
    });

    const unsubscribe = onSnapshot(userOnlineRef, (doc) => {
      if (doc.exists()) {
        const docData = doc.data();
        console.log("Current data: ", docData);
        handleChange(docData); // Call your function with the updated data
      } else {
        console.log("No such document!");
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();

  }, [])

  function handleChange(updatedData) {
    // Handle the change here
    console.log("80 gameId: ", updatedData.gameId);

    if (updatedData.inGame == true && updatedData.gameId != undefined) {
      navigation.navigate('Tictactoe', {
        screen: 'Tictactoe',
        params: {
         id: (updatedData != undefined ? updatedData.gameId : "none")
        }
      })
    }
  }

  const buttonLabels = ['Button 1', 'Button 2', 'Button 3', 'Button 4']
  return (
    <ScreenTemplate>
      <View style={[styles.container]}>
        <View style={{width:'100%'}}>
        <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        {invitesData.map((invite, index) => (
          <View key={index} style={styles.fullscreenButtonContainer}>
            <Button
              label={(invite.fromName != undefined ? invite.fromName : "unknown")}
              color={colors.tertiary}
              style={styles.scrollViewButton}
              onPress={() => {
                navigation.navigate('ModalStacks', {
                  screen: 'Post',
                  params: {
                    type: "invite",
                    from: invite.from,
                    fromName: invite.fromName,
                    to: invite.to,
                    toName: invite.toName,
                    data: userData
                  }
                })
              }}
            />
          </View>
        ))}
      </ScrollView>
        </View>
      </View>
    </ScreenTemplate>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width:'100%'
  },
  field: {
    fontSize: fontSize.middle,
    textAlign: 'center',
  },
  scrollViewContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: "100%"
  },
  fullscreenButtonContainer: {
    width: 500,
    justifyContent: 'center',
    alignItems: 'center'
  },
  scrollViewButton: {
    width: "100%",
    alignSelf: 'center',
  }
})