'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Menu, Users, Calendar, UserPlus, Info, LogIn, LogOut, AlertTriangle, Home, Trash2, User } from 'lucide-react'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

interface Sanction {
  id: number
  date: string
  description: string
}

interface User {
  id: number
  username: string
  password: string
  name: string
  department: string
  email: string
  sanctions: Sanction[]
  status: 'active' | 'inactive' | 'suspended'
  inFerie: boolean
  feriePeriod?: { start: string; end: string }
}

const ADMIN_USERNAME = 'test'
const ADMIN_PASSWORD = '1234'

export default function StaffManagement() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loginUsername, setLoginUsername] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [newSanction, setNewSanction] = useState({ date: '', description: '' })
  const [isAddingSanction, setIsAddingSanction] = useState(false)
  const [activePage, setActivePage] = useState('dashboard')
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null)
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false)

  useEffect(() => {
    const savedUsers = localStorage.getItem('users')
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('users', JSON.stringify(users))
  }, [users])

  const handleLogin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (loginUsername === ADMIN_USERNAME && loginPassword === ADMIN_PASSWORD) {
      setIsLoggedIn(true)
      setIsAdmin(true)
      setLoggedInUser({ id: 0, username: ADMIN_USERNAME, password: ADMIN_PASSWORD, name: 'Admin', department: 'Administration', email: 'admin@example.com', sanctions: [], status: 'active', inFerie: false })
      toast.success('Accesso amministratore effettuato con successo!')
    } else {
      const user = users.find(u => u.username === loginUsername && u.password === loginPassword)
      if (user) {
        setIsLoggedIn(true)
        setIsAdmin(false)
        setLoggedInUser(user)
        toast.success('Accesso effettuato con successo!')
      } else {
        toast.error('Credenziali non valide')
      }
    }
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setIsAdmin(false)
    setLoginUsername('')
    setLoginPassword('')
    setActivePage('dashboard')
    setLoggedInUser(null)
    toast.info('Disconnessione effettuata')
  }

  const addUser = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const newUser: User = {
      id: users.length + 1,
      username: formData.get('username') as string,
      password: formData.get('password') as string,
      name: formData.get('name') as string,
      department: formData.get('department') as string,
      email: formData.get('email') as string,
      sanctions: [],
      status: 'active',
      inFerie: false,
    }
    setUsers([...users, newUser])
    event.currentTarget.reset()
    toast.success('Nuovo utente aggiunto!')
  }

  const addSanction = () => {
    if (selectedUser && isAdmin) {
      const updatedUsers = users.map(user => {
        if (user.id === selectedUser.id) {
          return {
            ...user,
            sanctions: [
              ...user.sanctions,
              { id: user.sanctions.length + 1, ...newSanction }
            ]
          }
        }
        return user
      })
      setUsers(updatedUsers)
      setSelectedUser({
        ...selectedUser,
        sanctions: [
          ...selectedUser.sanctions,
          { id: selectedUser.sanctions.length + 1, ...newSanction }
        ]
      })
      setNewSanction({ date: '', description: '' })
      setIsAddingSanction(false)
      toast.success('Sanzione aggiunta con successo!')
    }
  }

  const removeSanction = (sanctionId: number) => {
    if (selectedUser && isAdmin) {
      const updatedUsers = users.map(user => {
        if (user.id === selectedUser.id) {
          return {
            ...user,
            sanctions: user.sanctions.filter(sanction => sanction.id !== sanctionId)
          }
        }
        return user
      })
      setUsers(updatedUsers)
      setSelectedUser({
        ...selectedUser,
        sanctions: selectedUser.sanctions.filter(sanction => sanction.id !== sanctionId)
      })
      toast.success('Sanzione rimossa con successo!')
    }
  }

  const requestVacation = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const startDate = formData.get('start-date') as string
    const endDate = formData.get('end-date') as string
    
    if (loggedInUser) {
      const updatedUsers = users.map(user => {
        if (user.id === loggedInUser.id) {
          return {
            ...user,
            inFerie: true,
            feriePeriod: { start: startDate, end: endDate }
          }
        }
        return user
      })
      setUsers(updatedUsers)
      setLoggedInUser({
        ...loggedInUser,
        inFerie: true,
        feriePeriod: { start: startDate, end: endDate }
      })
      toast.success('Richiesta ferie inviata con successo!')
    }
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <ToastContainer position="top-right" autoClose={3000} />
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>Accesso</CardTitle>
            <CardDescription>Inserisci le tue credenziali per accedere</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                <LogIn className="mr-2 h-4 w-4" />
                Accedi
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <ToastContainer position="top-right" autoClose={3000} />
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(true)} className="mr-2 text-white">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Open menu</span>
            </Button>
            <h1 className="text-2xl font-bold">Gestione Staff</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span>{loggedInUser?.name} ({isAdmin ? 'Admin' : 'Utente'})</span>
            <Button onClick={handleLogout} className="bg-red-500 hover:bg-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              Disconnetti
            </Button>
          </div>
        </div>
      </header>

      <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
            <SheetDescription>Naviga tra le diverse sezioni</SheetDescription>
          </SheetHeader>
          <div className="grid gap-4 py-4">
            <Button variant="ghost" className="w-full justify-start" onClick={() => { setActivePage('dashboard'); setIsMenuOpen(false); }}>
              <Home className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
            {isAdmin && (
              <Button variant="ghost" className="w-full justify-start" onClick={() => { setActivePage('users'); setIsMenuOpen(false); }}>
                <Users className="mr-2 h-4 w-4" />
                Gestione Utenti
              </Button>
            )}
            <Button variant="ghost" className="w-full justify-start" onClick={() => { setActivePage('vacation'); setIsMenuOpen(false); }}>
              <Calendar className="mr-2 h-4 w-4" />
              Richiesta Ferie
            </Button>
            <Button variant="ghost" className="w-full justify-start" onClick={() => { setActivePage('profile'); setIsMenuOpen(false); }}>
              <User className="mr-2 h-4 w-4" />
              Profilo Utente
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <main className="container mx-auto mt-8 p-4">
        {activePage === 'dashboard' && (
          <Card>
            <CardHeader>
              <CardTitle>Dashboard</CardTitle>
              <CardDescription>Panoramica generale del sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle>Totale Utenti</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{users.length}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Sanzioni Totali</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">
                      {users.reduce((total, user) => total + user.sanctions.length, 0)}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Utenti in Ferie</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">
                      {users.filter(user => user.inFerie).length}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        )}

        {activePage === 'users' && isAdmin && (
          <>
            <Card className="mb-4">
              <CardHeader>
                <CardTitle>Crea Nuovo Utente</CardTitle>
                <CardDescription>Aggiungi un nuovo utente al sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={addUser} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-username">Username</Label>
                    <Input id="new-username" name="username" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">Password</Label>
                    <Input id="new-password" name="password" type="password" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-name">Nome e Cognome</Label>
                    <Input id="new-name" name="name" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-department">Dipartimento</Label>
                    <Input id="new-department" name="department" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-email">Email</Label>
                    <Input type="email" id="new-email" name="email" required />
                  </div>
                  <Button type="submit">Aggiungi Utente</Button>
                </form>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Utenti</CardTitle>
                <CardDescription>Lista degli utenti registrati</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {users.map((user) => (
                    <li key={user.id}>
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => { setSelectedUser(user); setIsUserDialogOpen(true); }}
                      >
                        <UserPlus className="mr-2 h-4 w-4" />
                        <span className={`w-4 h-4 rounded-full mr-2 ${user.inFerie ? 'bg-red-500' : 'bg-green-500'}`}></span>
                        {user.name} - {user.department}
                      </Button>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </>
        )}

        {activePage === 'vacation' && (
          <Card>
            <CardHeader>
              <CardTitle>Richiesta Ferie</CardTitle>
              <CardDescription>Compila il modulo per richiedere le ferie</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={requestVacation} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="start-date">Data di inizio</Label>
                  <Input type="date" id="start-date" name="start-date" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-date">Data di fine</Label>
                  <Input type="date" id="end-date" name="end-date" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reason">Motivo della richiesta</Label>
                  <textarea id="reason" name="reason" rows={3} className="w-full p-2 border rounded" />
                </div>
                <Button type="submit">Invia Richiesta</Button>
              </form>
            </CardContent>
          </Card>
        )}

        {activePage === 'profile' && loggedInUser && (
          <Card>
            <CardHeader>
              <CardTitle>Profilo Utente</CardTitle>
              <CardDescription>Informazioni sul tuo account</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Nome:</strong> {loggedInUser.name}</p>
                <p><strong>Username:</strong> {loggedInUser.username}</p>
                <p><strong>Dipartimento:</strong> {loggedInUser.department}</p>
                <p><strong>Email:</strong> {loggedInUser.email}</p>
                <p><strong>Stato:</strong> {loggedInUser.status}</p>
                <p><strong>In ferie:</strong> {loggedInUser.inFerie ? 'Sì' : 'No'}</p>
                {loggedInUser.inFerie && loggedInUser.feriePeriod && (
                  <p><strong>Periodo ferie:</strong> Dal {loggedInUser.feriePeriod.start} al {loggedInUser.feriePeriod.end}</p>
                )}
                <div>
                  <strong>Sanzioni:</strong>
                  {loggedInUser.sanctions.length > 0 ? (
                    <ul className="mt-2 space-y-2">
                      {loggedInUser.sanctions.map((sanction) => (
                        <li key={sanction.id} className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
                          <AlertTriangle className="inline-block mr-2 h-4 w-4" />
                          <span className="font-bold">{sanction.date}:</span> {sanction.description}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-2">Nessuna sanzione registrata.</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dettagli Utente</DialogTitle>
            <DialogDescription>Informazioni su {selectedUser?.name}</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-2">
              <p><strong>Nome:</strong> {selectedUser.name}</p>
              <p><strong>Username:</strong> {selectedUser.username}</p>
              <p><strong>Dipartimento:</strong> {selectedUser.department}</p>
              <p><strong>Email:</strong> {selectedUser.email}</p>
              <p><strong>Stato:</strong> {selectedUser.status}</p>
              <p><strong>In ferie:</strong> {selectedUser.inFerie ? 'Sì' : 'No'}</p>
              {selectedUser.inFerie && selectedUser.feriePeriod && (
                <p><strong>Periodo ferie:</strong> Dal {selectedUser.feriePeriod.start} al {selectedUser.feriePeriod.end}</p>
              )}
              <div>
                <strong>Sanzioni:</strong>
                {selectedUser.sanctions.length > 0 ? (
                  <ul className="mt-2 space-y-2">
                    {selectedUser.sanctions.map((sanction) => (
                      <li key={sanction.id} className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded flex justify-between items-center">
                        <div>
                          <AlertTriangle className="inline-block mr-2 h-4 w-4" />
                          <span className="font-bold">{sanction.date}:</span> {sanction.description}
                        </div>
                        {isAdmin && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSanction(sanction.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2">Nessuna sanzione registrata.</p>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            {isAdmin && (
              <Button onClick={() => setIsAddingSanction(true)}>
                <AlertTriangle className="mr-2 h-4 w-4" />
                Aggiungi Sanzione
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddingSanction} onOpenChange={setIsAddingSanction}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aggiungi Sanzione Disciplinare</DialogTitle>
            <DialogDescription>
              Inserisci i dettagli della sanzione per {selectedUser?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="sanction-date">Data</Label>
              <Input
                id="sanction-date"
                type="date"
                value={newSanction.date}
                onChange={(e) => setNewSanction({ ...newSanction, date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sanction-description">Descrizione</Label>
              <textarea
                id="sanction-description"
                rows={3}
                className="w-full p-2 border rounded"
                value={newSanction.description}
                onChange={(e) => setNewSanction({ ...newSanction, description: e.target.value })}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={addSanction}>Aggiungi Sanzione</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <footer className="bg-gray-800 text-white py-4 mt-8">
        <div className="container mx-auto text-center">
          <p>&copy; 2023 Gestione Staff. Tutti i diritti riservati.</p>
          <p className="mt-2">Contattaci: support@gestionestaff.com | Tel: +39 123 456 7890</p>
        </div>
      </footer>
    </div>
  )
}