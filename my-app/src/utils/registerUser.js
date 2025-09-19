import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../firebase'

export async function registerUser(email, password, name, profileExtras = {}) {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    const { user } = cred // destructure FIRST

    const displayName =
      (name && name.trim()) ||
      (profileExtras?.username && String(profileExtras.username).trim()) ||
      (user.email ? user.email.split('@')[0] : '')

    if (auth.currentUser && displayName) {
      await updateProfile(auth.currentUser, { displayName })
    }

    const userDoc = {
      uid: user.uid,
      email: user.email,
      name: displayName,
      ...profileExtras, // age_range, current_job_role, industry, educational_background, years_of_experience
      createdAt: serverTimestamp(),
    }

    await setDoc(doc(db, 'users', user.uid), userDoc)

    console.log('User registered and stored in Firestore:', userDoc)
    return { uid: user.uid }
  } catch (err) {
    const code = err?.code || ''
    let message = 'Failed to register. Please try again.'
    
    if (code === 'auth/email-already-in-use') {
      // If email already exists in Firebase, try to sign in instead
      try {
        const { signInWithEmailAndPassword } = await import('firebase/auth')
        const cred = await signInWithEmailAndPassword(auth, email, password)
        const { user } = cred
        
        // Update the user's profile in Firestore
        const displayName =
          (name && name.trim()) ||
          (profileExtras?.username && String(profileExtras.username).trim()) ||
          (user.email ? user.email.split('@')[0] : '')

        const userDoc = {
          uid: user.uid,
          email: user.email,
          name: displayName,
          ...profileExtras,
          updatedAt: serverTimestamp(),
        }

        await setDoc(doc(db, 'users', user.uid), userDoc, { merge: true })
        console.log('Existing user signed in and profile updated:', userDoc)
        return { uid: user.uid }
      } catch (signInErr) {
        message = 'Email is already in use. Please try logging in instead.'
      }
    } else if (code === 'auth/invalid-email') message = 'Invalid email address.'
    else if (code === 'auth/weak-password') message = 'Password is too weak.'
    else if (code === 'permission-denied') message = 'Permission denied. Check Firestore rules.'
    else if (code === 'unavailable') message = 'Network issue. Try again later.'
    
    console.error('registerUser error:', err)
    throw new Error(message)
  }
}