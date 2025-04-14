import { useState } from "react"
import {useNavigate} from "raect-router"
import apiClient from "../../service/apiClient"
 
function SignUp() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    //for navigation
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            console.log(`trying to do a signup`);
            const data = await apiClient.signup(name, email, password)
            console.log('Signup response: ',data);
            
            if(data.succss){
                navigate('/login')
            } else{
                setError(data.message || 'Signup failed')
            }
        } catch (error) {

        }  
        
        finally{
            setLoading(false)
        }
        // make an API call ot backend 
        // get response from backend 
        // take action based on response
    }
    return(
        <div>
            <h1>Welcome to SignUp page</h1>
            {error && <div>Error: {error}</div>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="name">Name:</label>
                    <input 
                    type="text" 
                    name="name" 
                    id="name" 
                    value={name}
                    required
                    onChange={(e) => setName(e.target.value)}
                    />
                </div>
                <div>
                    <label htmlFor="email">Email:</label>
                    <input 
                    type="email" 
                    name="email" 
                    id="email" 
                    value={email}
                    required
                    onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div>
                    <label htmlFor="password">Password:</label>
                    <input 
                    type="password" 
                    name="password" 
                    id="password" 
                    value={password}
                    required
                    onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                {/* {boolean ? '' : ''}  - COnditional rendering*/}
                <button
                type="submit"
                disabled={loading}>
                    {loading ? 'Signup.....' : 'SignUp'}
                </button>
            </form>
        </div>
    )
}

export default SignUp