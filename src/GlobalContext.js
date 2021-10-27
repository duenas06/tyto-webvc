import { useState, useRef, createContext, useContext } from 'react'

const UserContext = createContext()
const StartContext = createContext()
const ClientContext = createContext()
const AppIdContext = createContext()
const TokenContext = createContext()
const ChannelNameContext = createContext()


export const useUsers = () => {
    return useContext(UserContext)
}


export const useStart = () => {
    return useContext(StartContext)
}


export const useClient = () => {
    return useContext(ClientContext)
}

export const useAppID = () => {
    return useContext(AppIdContext)
}

export const useToken = () => {
    return useContext(TokenContext)
}

export const useChannel = () => {
    return useContext(ChannelNameContext)
}


export const GlobalProvider = ({ children }) => {

    const [users, setUsers] = useState([])
    const [start, setStart] = useState(false)
    const [appId, setAppId] = useState('')
    const [token, setToken] = useState('')
    const [channelName, setChannelName] = useState('')
    const rtc = useRef({
        // For the local client.
        client: null,
        // For the local audio and video tracks.
        localAudioTrack: null,
        localVideoTrack: null,
    });


    return (
        <ClientContext.Provider value = {rtc}>
            <UserContext.Provider value={[users, setUsers]}>
                <StartContext.Provider value={[start, setStart]}>
                    <AppIdContext.Provider value={[appId, setAppId]}>
                        <TokenContext.Provider value={[token, setToken]}>
                            <ChannelNameContext.Provider value={[channelName, setChannelName]}>
                                {children}
                            </ChannelNameContext.Provider>
                        </TokenContext.Provider>
                    </AppIdContext.Provider>
                </StartContext.Provider>
            </UserContext.Provider>
        </ClientContext.Provider>
    )
}
