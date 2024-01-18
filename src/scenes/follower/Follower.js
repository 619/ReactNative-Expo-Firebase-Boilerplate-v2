import React, { useEffect, useContext, useState } from 'react'
import { Text, View, StyleSheet } from 'react-native'
import ScreenTemplate from '../../components/ScreenTemplate'
import { colors, fontSize } from '../../theme'
import { ColorSchemeContext } from '../../context/ColorSchemeContext'
import Button from '../../components/Button'
import { showToast } from '../../utils/ShowToast'
import ShowSnackbar from '../../components/ShowSnackbar'
import { useNavigation } from '@react-navigation/native'
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase/config';
import { collection, onSnapshot, doc, updateDoc, setDoc } from 'firebase/firestore';
import { firestore } from '../../firebase/config';
import { UserDataContext } from "./../../context/UserDataContext";
import { AppState } from 'react-native';

export default function Follower() {
  const navigation = useNavigation()
  const { scheme } = useContext(ColorSchemeContext)
  const [visible, setVisible] = useState(false)
  const isDark = scheme === 'dark'
  const colorScheme = {
    text: isDark? colors.white : colors.primaryText
  }
  const [onlineData, setOnlineData] = useState([]);
  const { userData } = useContext(UserDataContext)
  const userOnlineRef = doc(firestore, 'online', userData.id); // Reference to the user's online document
  console.log('28: ', userData.id, userData.email)
  useEffect(() => {
    console.log('Follower screen')
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // Reference to the 'invites' subcollection inside the user's document
        const invitesRef = collection(firestore, 'online');
    
        // Listen for changes in the 'invites' subcollection
        onSnapshot(invitesRef, (querySnapshot) => {
          const onlineData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setOnlineData(onlineData); // Assuming you have a state setter for invites data
          // setLoggedIn(true);
          // setChecked(true);
        });
      } else {
        // setLoggedIn(false);
        // setChecked(true);
        console.log('test')
      }
    });

    const handleAppStateChange = async (nextAppState) => {
      if (nextAppState === 'active') {
        // User is active in the app
        console.log('-------------user is active--------------')
        await setDoc(userOnlineRef, { email: userData.email, id: userData.id, online: true });
      } else if (nextAppState.match(/inactive|background/)) {
        // User is not active in the app
        console.log('-------------user is inactive--------------')
        await setDoc(userOnlineRef, { email: userData.email, id: userData.id, online: false });
      }
    };

    AppState.addEventListener('change', handleAppStateChange);

    // Return a cleanup function to remove the event listener
    return () => {
      // AppState.removeEventListener('change', handleAppStateChange);
    };
  }, [])

  const onDismissSnackBar = () => setVisible(false)

  return (
    <>
    <ScreenTemplate>
      <View style={styles.container}>
        <View style={{width:'100%'}}>
        {onlineData.map((online, index) => (
          <View key={index} style={styles.fullscreenButtonContainer}>
            <Button
              label={(online.email != undefined ? online.email : "unknown")}
              color={colors.tertiary}
              style={styles.scrollViewButton}
              onPress={() => {
                navigation.navigate('ModalStacks', {
                  screen: 'Post',
                  params: {
                    type: "online",
                    from: userData.id,
                    fromName: userData.email,
                    to: online.id,
                    toName: online.email,
                    data: userData
                  }
                })
              }}
            />
          </View>
        ))}
        </View>
      </View>
    </ScreenTemplate>
    <ShowSnackbar
      visible={visible}
      onDismissSnackBar={onDismissSnackBar}
      title='Hello 👋'
      duration={3000}
    />
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  field: {
    fontSize: fontSize.middle,
    textAlign: 'center',
  },
})