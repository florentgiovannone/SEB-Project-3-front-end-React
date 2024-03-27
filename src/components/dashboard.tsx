import { IUser } from "../interfaces/user"
import { IWines } from "../interfaces/wine";
import Footer from "./footer";
import React, { SyntheticEvent, useEffect, useState } from "react"
import axios from "axios";
import WineCardDashboard from "./WinecardDashboard";
import { useNavigate, useParams } from "react-router-dom"

type Wines = null | Array<IWines>
export default function Dashboard({ user }: { user: null | IUser }) {

    const [currentUser, updateCurrentUser] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [lastPasswordChange, setLastPasswordChange] = useState<Date | null>(null);

    async function fetchUser() {
        const token = localStorage.getItem('token')
        const resp = await axios.get(`/api/rouge/user`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        updateCurrentUser(resp.data._id)
    }

    function handleOpenModal() {
        setIsModalOpen(true);
    }

    function handleCloseModal() {
        setIsModalOpen(false);
    }

    async function handleChangePassword() {
        if (newPassword !== confirmPassword) {
            alert('New password and confirmed password do not match');
            return;
        }
        const token = localStorage.getItem('token')
        const resp = await axios.post(`/api/rouge/user/verify-password`, { password: oldPassword }, {
            headers: { Authorization: `Bearer ${token}` }
        })
        if (resp.data.isPasswordCorrect) {
            await axios.put(`/api/rouge/user`, { password: newPassword }, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setLastPasswordChange(new Date());
            fetchUser()
        } else {
            alert('Old password is incorrect');
        }
    }

    React.useEffect(() => {
        const token = localStorage.getItem('token')
        if (token) fetchUser()
    }, [])

    const [wines, setWines] = React.useState<Wines>(null)

    React.useEffect(() => {
        async function fetchWines() {
            const token = localStorage.getItem('token')
            const resp = await fetch(`/api/rouge/user/cave/${currentUser}`, 
            { headers: { Authorization: `Bearer ${token}` } })
            const data = await resp.json()
            setWines(data.myCave)

        }
        fetchWines()
    }, [currentUser])
    console.log("wines", wines);

    return <> <h1 className="title has-text-centered is-rouge mt-6">My Dashboard</h1>
        <section className="section">
            <div className=" container has-text-centered is-widescreen">
                <div className="account column is-rounded background-is-grey is-centered m-6">
                    <h5 className="title has-text-black has-text-centered mb-6">My Account</h5>
                    <p className="is-rouge has-text-weight-semibold has-text-centered mb-3"><span className="title has-text-black is-rouge is-4">{`Firstname:`}</span> {user?.firstName}</p>
                    <p className="is-rouge has-text-weight-semibold has-text-centered mb-3"><span className="title has-text-black is-rouge is-4">{`Lastname:`}</span> {user?.lastName}</p>
                    <p className="is-rouge has-text-weight-semibold has-text-centered mb-3"><span className="title has-text-black is-rouge is-4">{`Username:`}</span> {user?.userName}</p>
                    <p className="is-rouge has-text-weight-semibold has-text-centered mb-3"><span className="title has-text-black is-rouge is-4">{`Email:`}</span> {user?.email}</p>
                    <a href={`/updateaccount/${currentUser}`}><button className="button">Update account</button></a>
                </div>
                <div className="account column is-rounded background-is-grey  m-6">
                    <h5 className="title has-text-black has-text-centered mb-6">My Cave</h5>
                    <div className="columns has-text-centered is-centered is-centered m-6">
                        <div className="columns has-text-centered is-centered is-multiline">
                            {wines?.map((wine) => {
                                return <WineCardDashboard
                                    key={wine._id}
                                    {...wine}
                                />
                            })}
                        </div>
                    </div>

                </div>
                <div className="columns has-text-centered is-centered is-multiline">
                    <a href="/user"><button className="button  border-is-rouge">Search users</button></a>
                </div>
            </div>
        </section>
        <Footer />
    </>
}