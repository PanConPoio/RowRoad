import { Routes, Route } from 'react-router-dom'

import './globals.css';
import SinginForm from './_auth/forms/SinginForm';
import { AllUsers, CreatePost, EditPost, Explore, Home, LikePosts, Messages, Notification, PostDetails, Profile, Saved, UpdateProfile, } from './_root/pages';
import SingupForm from './_auth/forms/SingupForm';
import AuthLayout from './_auth/AuthLayout';
import RootLayout from './_root/RootLayout';
import { Toaster } from "@/components/ui/toaster" 
import RestartPassword from './_auth/forms/RestartPassword';

const App = () => {
  return (
   <main className="flex h-screen"> 
   
   <Routes>
    {/*routes publicas */}
    <Route element={<AuthLayout />}>

    <Route path="/sing-in" element={<SinginForm />} />
    <Route path="/restart-password" element={<RestartPassword />} />
    <Route path="/sing-up" element={<SingupForm />} />

    </Route>

    
    {/*routes privadas */}
    <Route element={<RootLayout />}>
    <Route index element={<Home />} />
    <Route path="/explore" element={ <Explore />}/>
    <Route path="/saved" element={ <Saved />}/>
    <Route path="/all-users" element={ <AllUsers />}/>
    <Route path="/messages" element={ <Messages />}/>
    <Route path='/notification' element={< Notification/>}/>
    <Route path="/create-post" element={ <CreatePost />}/>
    <Route path="/update-post/:id" element={ <EditPost />}/>
    <Route path="/posts/:id" element={ <PostDetails />}/>
    <Route path="/profile/:id/*" element={ <Profile />}/>
    <Route path="/update-profile/:id" element={ <UpdateProfile />}/>
    <Route path="/like-posts" element={ <LikePosts />}/>


    
    </Route>

   </Routes>

   <Toaster/> 
   </main>
  )
} 

export default App
