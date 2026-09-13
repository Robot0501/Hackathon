import React, { useEffect, useState } from "react";
import { api } from "../lib/api";
import { Link } from "react-router-dom";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { toast } from "sonner";
import { Search, UserPlus, Check, X } from "lucide-react";

const roleTone = { student: "bg-blue-100 text-blue-800", alumni: "bg-emerald-100 text-emerald-800", employer: "bg-purple-100 text-purple-800", admin: "bg-amber-100 text-amber-800" };

const UserRow = ({ u, action }) => {
  const initials = `${(u.first_name||"?")[0]}${(u.last_name||"")[0]||""}`.toUpperCase();
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border hover:border-blue-300 transition-colors">
      <Avatar className="w-11 h-11"><AvatarFallback className="bg-slate-900 text-white">{initials}</AvatarFallback></Avatar>
      <div className="flex-1 min-w-0">
        <Link to={`/profile/${u.id}`} data-testid={`user-link-${u.id}`} className="font-medium truncate block hover:text-blue-600">{u.first_name} {u.last_name}</Link>
        <div className="text-xs text-slate-500 truncate">{u.headline || u.company_name || u.role}</div>
      </div>
      <Badge variant="outline" className={roleTone[u.role]}>{u.role}</Badge>
      {action}
    </div>
  );
};

export default function Network() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [suggested, setSuggested] = useState([]);
  const [connections, setConnections] = useState([]);
  const [pending, setPending] = useState([]);

  const load = async () => {
    setSuggested((await api.get("/users/suggested")).data);
    setConnections((await api.get("/connections?status=accepted")).data);
    setPending((await api.get("/connections?status=pending")).data);
  };
  useEffect(() => { load(); }, []);
  useEffect(() => {
    const t = setTimeout(async () => {
      if (q.length >= 2) setResults((await api.get(`/users/search?q=${encodeURIComponent(q)}`)).data);
      else setResults([]);
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  const request = async (id) => { await api.post(`/connections/request/${id}`); toast.success("Request sent"); load(); };
  const accept = async (id) => { await api.post(`/connections/${id}/accept`); toast.success("Accepted"); load(); };
  const reject = async (id) => { await api.post(`/connections/${id}/reject`); load(); };

  return (
    <div className="space-y-4">
      <h1 className="font-heading font-extrabold text-3xl">My Network</h1>
      <Card><CardContent className="p-4">
        <div className="relative"><Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <Input data-testid="network-search" className="pl-9" placeholder="Search students, alumni, employers…" value={q} onChange={(e)=>setQ(e.target.value)} />
        </div>
        {results.length > 0 && <div className="mt-3 space-y-2">{results.map((u) => <UserRow key={u.id} u={u} action={<Button size="sm" onClick={()=>request(u.id)} data-testid={`connect-${u.id}`}><UserPlus className="w-4 h-4 mr-1" /> Connect</Button>} />)}</div>}
      </CardContent></Card>

      <Tabs defaultValue="suggested">
        <TabsList><TabsTrigger value="suggested" data-testid="tab-suggested">Suggested</TabsTrigger><TabsTrigger value="connections" data-testid="tab-connections">Connections ({connections.length})</TabsTrigger><TabsTrigger value="pending" data-testid="tab-pending">Pending ({pending.length})</TabsTrigger></TabsList>
        <TabsContent value="suggested" className="mt-3 space-y-2">
          {suggested.length ? suggested.map((u) => <UserRow key={u.id} u={u} action={<Button size="sm" onClick={()=>request(u.id)} data-testid={`sug-connect-${u.id}`}><UserPlus className="w-4 h-4 mr-1" /> Connect</Button>} />) : <div className="text-sm text-slate-500 p-6 text-center">No suggestions yet.</div>}
        </TabsContent>
        <TabsContent value="connections" className="mt-3 space-y-2">
          {connections.length ? connections.map((c) => <UserRow key={c.user.id} u={c.user} action={<Badge className="bg-emerald-100 text-emerald-800">Connected</Badge>} />) : <div className="text-sm text-slate-500 p-6 text-center">No connections yet.</div>}
        </TabsContent>
        <TabsContent value="pending" className="mt-3 space-y-2">
          {pending.length ? pending.map((c) => {
            const isIncoming = c.requested_by === c.user.id;
            return <UserRow key={c.user.id} u={c.user} action={isIncoming ? <div className="flex gap-1"><Button size="sm" onClick={()=>accept(c.user.id)} data-testid={`accept-${c.user.id}`}><Check className="w-4 h-4" /></Button><Button size="sm" variant="outline" onClick={()=>reject(c.user.id)} data-testid={`reject-${c.user.id}`}><X className="w-4 h-4" /></Button></div> : <Badge variant="outline">Awaiting</Badge>} />;
          }) : <div className="text-sm text-slate-500 p-6 text-center">Nothing pending.</div>}
        </TabsContent>
      </Tabs>
    </div>
  );
}
