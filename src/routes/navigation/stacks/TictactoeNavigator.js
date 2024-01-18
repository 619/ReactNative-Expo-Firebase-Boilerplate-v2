import React, { useContext } from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { ColorSchemeContext } from '../../../context/ColorSchemeContext'
import { lightProps, darkProps } from './navigationProps/navigationProps'
import HeaderStyle from './headerComponents/HeaderStyle'

import Tictactoe from '../../../scenes/tictactoe'
const Stack = createStackNavigator()

const TictactoeNavigator = () => {
  const { scheme } = useContext(ColorSchemeContext)
  const navigationProps = scheme === 'dark' ? darkProps:lightProps
  return (
    <Stack.Navigator screenOptions={navigationProps}>
      <Stack.Screen
        name="Tictactoe"
        component={Tictactoe}
        options={({ navigation }) => ({
          headerBackground: scheme === 'dark' ? null: () => <HeaderStyle />,
        })}
      />
    </Stack.Navigator>
  )
}

export default TictactoeNavigator
