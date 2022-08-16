import React from 'react'
import Main from './navigation'
import Initial from '../scenes/initial/Initial'
import { useAtom } from 'jotai'
import { checkedAtom, loggedInAtom } from '../utils/atom'

const Routes = () => {
  const [checked, setCehecked] = useAtom(checkedAtom)
  const [loggedIn, setLoggedIn] = useAtom(loggedInAtom)

  // TODO: switch router by loggedIn state
  console.log('[##] loggedIn', loggedIn)

  // rendering
  if (!checked) {
    return <Initial />
  }

  return <Main />
}

export default Routes
