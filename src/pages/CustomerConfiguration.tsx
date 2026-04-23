import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Select as MobileSelect,
  SelectContent as MobileSelectContent,
  SelectItem as MobileSelectItem,
  SelectTrigger as MobileSelectTrigger,
  SelectValue as MobileSelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Search,
  Save,
  RotateCcw,
  Eye,
  EyeOff,
  Copy,
  ExternalLink,
  Database,
  Cloud,
  KeyRound,
  Mail,
  FolderCog,
  Settings2,
  Video,
  Brain,
  Sparkles,
  Layers,
  Clock,
  type LucideIcon,
} from "lucide-react";

type FieldType = "text" | "select" | "boolean" | "secret" | "url" | "number";

interface ConfigField {
  id: string;
  label: string;
  type: FieldType;
  defaultValue?: string | boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
}

interface ConfigGroup {
  id: string;
  label: string;
  icon: LucideIcon;
  description: string;
  fields: ConfigField[];
}

const initialMockCustomers = [
  { id: 1, name: "101abc1" },
  { id: 2, name: "1258c11" },
  { id: 3, name: "56785555" },
  { id: 4, name: "66y" },
  { id: 5, name: "9test" },
];

const fieldHeadingClass =
  "text-xs font-semibold text-foreground mb-2 block uppercase tracking-wide";

const configGroups: ConfigGroup[] = [
  {
    id: "connection",
    label: "Connection",
    icon: Database,
    description: "Primary database connection string and target DB name.",
    fields: [
      {
        id: "connectionString",
        label: "Connection",
        type: "text",
        defaultValue: "mongodb://10.10.2.39:27017",
      },
      { id: "database", label: "Database", type: "text", defaultValue: "CourseEDV6" },
    ],
  },
  {
    id: "azure",
    label: "Azure Settings",
    icon: Cloud,
    description: "Azure Blob Storage credentials and container settings.",
    fields: [
      { id: "azureAccountName", label: "Account Name", type: "text", defaultValue: "courseedstorage" },
      { id: "azureAccountKey", label: "Account Key", type: "secret", defaultValue: "abc123def456==" },
      { id: "azureContainer", label: "Container Name", type: "text", defaultValue: "course-assets" },
      { id: "azureEndpoint", label: "Endpoint", type: "url", defaultValue: "https://courseedstorage.blob.core.windows.net" },
    ],
  },
  {
    id: "crypto",
    label: "Crypto",
    icon: KeyRound,
    description: "Encryption and hashing configuration.",
    fields: [
      {
        id: "hashAlgorithm",
        label: "Hash Algorithm",
        type: "select",
        defaultValue: "SHA256",
        options: [
          { value: "SHA256", label: "SHA-256" },
          { value: "SHA512", label: "SHA-512" },
          { value: "MD5", label: "MD5" },
        ],
      },
      { id: "secretKey", label: "Secret Key", type: "secret", defaultValue: "supersecretkey123" },
      { id: "saltRounds", label: "Salt Rounds", type: "number", defaultValue: "10" },
    ],
  },
  {
    id: "mail",
    label: "Mail Settings",
    icon: Mail,
    description: "Outbound email provider and SMTP configuration.",
    fields: [
      {
        id: "emailProvider",
        label: "Email Provider",
        type: "select",
        defaultValue: "SMTP",
        options: [
          { value: "SMTP", label: "SMTP" },
          { value: "SENDGRID", label: "SendGrid" },
          { value: "SES", label: "AWS SES" },
        ],
      },
      { id: "smtpHost", label: "SMTP Host", type: "text", defaultValue: "smtp.office365.com" },
      { id: "smtpPort", label: "SMTP Port", type: "number", defaultValue: "587" },
      { id: "smtpUser", label: "Username", type: "text", defaultValue: "noreply@example.com" },
      { id: "smtpPass", label: "Password", type: "secret", defaultValue: "examplepass" },
      { id: "enableSsl", label: "Enable SSL", type: "boolean", defaultValue: true },
    ],
  },
  {
    id: "file",
    label: "File Config",
    icon: FolderCog,
    description: "Allowed file types and upload size limits.",
    fields: [
      { id: "maxUploadSize", label: "Max Upload Size (MB)", type: "number", defaultValue: "100" },
      { id: "allowedDocs", label: "Allowed Document Types", type: "text", defaultValue: "pdf,docx" },
      { id: "allowedMedia", label: "Allowed Media Types", type: "text", defaultValue: "mp3,mp4" },
      { id: "uploadPath", label: "Upload Path", type: "text", defaultValue: "/uploads" },
    ],
  },
  {
    id: "courseed",
    label: "CourseED Settings",
    icon: Settings2,
    description: "Core CourseED platform behaviour and limits.",
    fields: [
      { id: "appName", label: "Application Name", type: "text", defaultValue: "CourseED" },
      { id: "appUrl", label: "Application URL", type: "url", defaultValue: "https://courseed.example.com" },
      { id: "defaultLang", label: "Default Language", type: "select", defaultValue: "en", options: [
        { value: "en", label: "English" },
        { value: "fr", label: "French" },
        { value: "es", label: "Spanish" },
      ]},
      { id: "sessionTimeout", label: "Session Timeout (mins)", type: "number", defaultValue: "30" },
    ],
  },
  {
    id: "video",
    label: "Video Settings",
    icon: Video,
    description: "Video hosting and transcoding parameters.",
    fields: [
      { id: "videoProvider", label: "Provider", type: "select", defaultValue: "AZURE", options: [
        { value: "AZURE", label: "Azure Media" },
        { value: "AWS", label: "AWS MediaConvert" },
        { value: "MUX", label: "Mux" },
      ]},
      { id: "maxVideoSize", label: "Max Video Size (MB)", type: "number", defaultValue: "2048" },
      { id: "videoBitrate", label: "Default Bitrate (kbps)", type: "number", defaultValue: "2500" },
    ],
  },
  {
    id: "azureopenai",
    label: "Azure OpenAI",
    icon: Brain,
    description: "Azure OpenAI service endpoints and deployment names.",
    fields: [
      { id: "aoaiEndpoint", label: "Endpoint", type: "url", defaultValue: "https://example.openai.azure.com/" },
      { id: "aoaiKey", label: "API Key", type: "secret", defaultValue: "aoai-key-xxxxxx" },
      { id: "aoaiDeployment", label: "Deployment Name", type: "text", defaultValue: "gpt-4o" },
      { id: "aoaiApiVersion", label: "API Version", type: "text", defaultValue: "2024-02-15-preview" },
      { id: "aoaiEmbedDeployment", label: "Embedding Deployment", type: "text", defaultValue: "text-embedding-3-large" },
      { id: "aoaiTemperature", label: "Temperature", type: "number", defaultValue: "0.7" },
    ],
  },
  {
    id: "gemini",
    label: "Gemini Settings",
    icon: Sparkles,
    description: "Google Gemini API configuration.",
    fields: [
      { id: "geminiKey", label: "API Key", type: "secret", defaultValue: "gemini-key-xxxxxx" },
      { id: "geminiModel", label: "Model", type: "select", defaultValue: "gemini-1.5-pro", options: [
        { value: "gemini-1.5-pro", label: "Gemini 1.5 Pro" },
        { value: "gemini-1.5-flash", label: "Gemini 1.5 Flash" },
      ]},
      { id: "geminiTemperature", label: "Temperature", type: "number", defaultValue: "0.6" },
    ],
  },
  {
    id: "aws",
    label: "AWS Settings",
    icon: Cloud,
    description: "AWS access credentials and region.",
    fields: [
      { id: "awsAccessKey", label: "Access Key ID", type: "text", defaultValue: "AKIAEXAMPLE" },
      { id: "awsSecretKey", label: "Secret Access Key", type: "secret", defaultValue: "awssecretexample" },
      { id: "awsRegion", label: "Region", type: "select", defaultValue: "us-east-1", options: [
        { value: "us-east-1", label: "us-east-1" },
        { value: "us-west-2", label: "us-west-2" },
        { value: "eu-west-1", label: "eu-west-1" },
        { value: "ap-south-1", label: "ap-south-1" },
      ]},
      { id: "awsBucket", label: "S3 Bucket", type: "text", defaultValue: "courseed-prod" },
    ],
  },
  {
    id: "vector",
    label: "Vector DB",
    icon: Layers,
    description: "Vector search configuration for semantic retrieval.",
    fields: [
      { id: "enableVector", label: "Enable Vector Search", type: "boolean", defaultValue: true },
      { id: "vectorProvider", label: "Provider", type: "select", defaultValue: "PINECONE", options: [
        { value: "PINECONE", label: "Pinecone" },
        { value: "WEAVIATE", label: "Weaviate" },
        { value: "QDRANT", label: "Qdrant" },
      ]},
      { id: "vectorEndpoint", label: "Endpoint", type: "url", defaultValue: "https://example.svc.pinecone.io" },
      { id: "vectorApiKey", label: "API Key", type: "secret", defaultValue: "vec-key-xxxxxx" },
      { id: "vectorIndex", label: "Index Name", type: "text", defaultValue: "courseed-index" },
    ],
  },
  {
    id: "timezone",
    label: "Time Zone",
    icon: Clock,
    description: "Default time zone and date formatting.",
    fields: [
      { id: "timezone", label: "Time Zone", type: "select", defaultValue: "Asia/Kolkata", options: [
        { value: "Asia/Kolkata", label: "Asia/Kolkata (IST)" },
        { value: "UTC", label: "UTC" },
        { value: "America/New_York", label: "America/New_York" },
        { value: "Europe/London", label: "Europe/London" },
      ]},
      { id: "dateFormat", label: "Date Format", type: "select", defaultValue: "DD/MM/YYYY", options: [
        { value: "DD/MM/YYYY", label: "DD/MM/YYYY" },
        { value: "MM/DD/YYYY", label: "MM/DD/YYYY" },
        { value: "YYYY-MM-DD", label: "YYYY-MM-DD" },
      ]},
    ],
  },
];

type FieldValue = string | boolean;
type FormState = Record<string, Record<string, FieldValue>>;

const buildInitialState = (): FormState => {
  const state: FormState = {};
  for (const group of configGroups) {
    state[group.id] = {};
    for (const field of group.fields) {
      state[group.id][field.id] = field.defaultValue ?? (field.type === "boolean" ? false : "");
    }
  }
  return state;
};

const highlight = (text: string, query: string) => {
  if (!query.trim()) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-primary/20 text-foreground rounded px-0.5">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
};

const CustomerConfiguration = () => {
  const navigate = useNavigate();
  const { customerId } = useParams<{ customerId: string }>();
  const customer = initialMockCustomers.find((c) => c.id === Number(customerId));

  const [activeTab, setActiveTab] = useState<string>(configGroups[0].id);
  const [search, setSearch] = useState("");
  const [initialState] = useState<FormState>(() => buildInitialState());
  const [values, setValues] = useState<FormState>(() => buildInitialState());
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  const dirtyGroups = useMemo(() => {
    const set = new Set<string>();
    for (const group of configGroups) {
      for (const field of group.fields) {
        if (values[group.id][field.id] !== initialState[group.id][field.id]) {
          set.add(group.id);
          break;
        }
      }
    }
    return set;
  }, [values, initialState]);

  const totalFields = useMemo(
    () => configGroups.reduce((sum, g) => sum + g.fields.length, 0),
    [],
  );

  const filteredGroups = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return configGroups;
    return configGroups.filter((g) => {
      if (g.label.toLowerCase().includes(q)) return true;
      return g.fields.some((f) => f.label.toLowerCase().includes(q));
    });
  }, [search]);

  // Ensure activeTab is always visible
  const visibleActive = filteredGroups.find((g) => g.id === activeTab) ?? filteredGroups[0];
  const activeGroup = visibleActive ?? configGroups[0];

  const setValue = (groupId: string, fieldId: string, value: FieldValue) => {
    setValues((prev) => ({
      ...prev,
      [groupId]: { ...prev[groupId], [fieldId]: value },
    }));
  };

  const handleSave = () => {
    if (dirtyGroups.size === 0) {
      toast({ title: "No changes to save" });
      return;
    }
    toast({
      title: "Configuration saved",
      description: `${dirtyGroups.size} group(s) updated successfully.`,
    });
    // Reset baseline to current values
    setValues((v) => {
      // Re-seed initial via reload-like approach: mutate initialState would require state — keep simple
      return v;
    });
    // Force dirty recompute by replacing initialState reference is tricky with useState init.
    // Simplest: reload values into initial via a hack — set initial via state setter:
    setInitial(values);
  };

  const [initial, setInitial] = useState<FormState>(initialState);
  // override dirty calc using `initial`
  const dirtyGroupsLive = useMemo(() => {
    const set = new Set<string>();
    for (const group of configGroups) {
      for (const field of group.fields) {
        if (values[group.id][field.id] !== initial[group.id][field.id]) {
          set.add(group.id);
          break;
        }
      }
    }
    return set;
  }, [values, initial]);

  const handleDiscard = () => {
    setValues(structuredClone(initial));
    toast({ title: "Changes discarded" });
  };

  const handleCopy = (val: string) => {
    navigator.clipboard.writeText(val);
    toast({ title: "Copied to clipboard" });
  };

  const renderField = (groupId: string, field: ConfigField) => {
    const value = values[groupId][field.id];
    const matchesSearch =
      search.trim() && field.label.toLowerCase().includes(search.trim().toLowerCase());
    const labelNode = (
      <Label htmlFor={`${groupId}-${field.id}`} className={fieldHeadingClass}>
        {highlight(field.label, search)}
      </Label>
    );

    if (field.type === "boolean") {
      return (
        <div
          key={field.id}
          className={`flex items-center justify-between gap-4 rounded-lg border border-border bg-card px-4 py-3 ${
            matchesSearch ? "ring-2 ring-primary/30" : ""
          }`}
        >
          <div className="min-w-0">
            <Label htmlFor={`${groupId}-${field.id}`} className="text-sm font-semibold text-foreground">
              {highlight(field.label, search)}
            </Label>
          </div>
          <Switch
            id={`${groupId}-${field.id}`}
            checked={Boolean(value)}
            onCheckedChange={(checked) => setValue(groupId, field.id, checked)}
            aria-label={field.label}
          />
        </div>
      );
    }

    if (field.type === "select") {
      return (
        <div key={field.id} className={matchesSearch ? "ring-2 ring-primary/30 rounded-lg p-2 -m-2" : ""}>
          {labelNode}
          <Select
            value={String(value)}
            onValueChange={(v) => setValue(groupId, field.id, v)}
          >
            <SelectTrigger id={`${groupId}-${field.id}`} aria-label={field.label} className="rounded-md">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    }

    if (field.type === "secret") {
      const isRevealed = revealed[`${groupId}-${field.id}`];
      return (
        <div key={field.id} className={matchesSearch ? "ring-2 ring-primary/30 rounded-lg p-2 -m-2" : ""}>
          {labelNode}
          <div className="flex items-center gap-2">
            <Input
              id={`${groupId}-${field.id}`}
              type={isRevealed ? "text" : "password"}
              value={String(value)}
              onChange={(e) => setValue(groupId, field.id, e.target.value)}
              className="font-mono"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() =>
                setRevealed((r) => ({ ...r, [`${groupId}-${field.id}`]: !isRevealed }))
              }
              aria-label={isRevealed ? "Hide value" : "Show value"}
              className="shrink-0"
            >
              {isRevealed ? (
                <EyeOff className="w-4 h-4" aria-hidden="true" focusable="false" />
              ) : (
                <Eye className="w-4 h-4" aria-hidden="true" focusable="false" />
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => handleCopy(String(value))}
              aria-label="Copy value"
              className="shrink-0"
            >
              <Copy className="w-4 h-4" aria-hidden="true" focusable="false" />
            </Button>
          </div>
        </div>
      );
    }

    if (field.type === "url") {
      return (
        <div key={field.id} className={matchesSearch ? "ring-2 ring-primary/30 rounded-lg p-2 -m-2" : ""}>
          {labelNode}
          <div className="flex items-center gap-2">
            <Input
              id={`${groupId}-${field.id}`}
              type="url"
              value={String(value)}
              onChange={(e) => setValue(groupId, field.id, e.target.value)}
              placeholder={field.placeholder}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => window.open(String(value), "_blank", "noopener,noreferrer")}
              aria-label="Open URL in new tab"
              className="shrink-0"
              disabled={!String(value).startsWith("http")}
            >
              <ExternalLink className="w-4 h-4" aria-hidden="true" focusable="false" />
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div key={field.id} className={matchesSearch ? "ring-2 ring-primary/30 rounded-lg p-2 -m-2" : ""}>
        {labelNode}
        <Input
          id={`${groupId}-${field.id}`}
          type={field.type === "number" ? "number" : "text"}
          value={String(value)}
          onChange={(e) => setValue(groupId, field.id, e.target.value)}
          placeholder={field.placeholder}
        />
      </div>
    );
  };

  const isDirty = dirtyGroupsLive.size > 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          variant="outline"
          onClick={() => navigate("/customers")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" focusable="false" />
          Back to Customers
        </Button>

        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted-foreground">
          <ol className="flex items-center gap-2 flex-wrap">
            <li>
              <button
                onClick={() => navigate("/admin-module")}
                className="hover:text-primary transition-colors"
              >
                Admin Module
              </button>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <button
                onClick={() => navigate("/customers")}
                className="hover:text-primary transition-colors"
              >
                Customers
              </button>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-foreground font-medium">Configuration</li>
          </ol>
        </nav>

        {/* Sticky header */}
        <div className="sticky top-16 z-20 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4 bg-background/85 backdrop-blur-md border-b border-border mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground truncate">
                Customer configuration {customer ? `– ${customer.name}` : ""}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {configGroups.length} groups · {totalFields} fields
                {isDirty && (
                  <span className="ml-2 inline-flex items-center gap-1.5 text-primary font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" aria-hidden="true" />
                    {dirtyGroupsLive.size} unsaved
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {isDirty && (
                <Button variant="outline" onClick={handleDiscard}>
                  <RotateCcw className="w-4 h-4 mr-2" aria-hidden="true" focusable="false" />
                  Discard
                </Button>
              )}
              <Button onClick={handleSave} disabled={!isDirty}>
                <Save className="w-4 h-4 mr-2" aria-hidden="true" focusable="false" />
                Save configuration
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="relative mt-4">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
              aria-hidden="true"
              focusable="false"
            />
            <Input
              type="search"
              placeholder="Search any setting…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 rounded-full"
              aria-label="Search settings"
            />
          </div>
        </div>

        {/* Mobile group selector */}
        <div className="md:hidden mb-4">
          <Label htmlFor="mobile-group-select" className="sr-only">
            Select configuration group
          </Label>
          <MobileSelect value={activeGroup.id} onValueChange={setActiveTab}>
            <MobileSelectTrigger id="mobile-group-select" aria-label="Select configuration group">
              <MobileSelectValue />
            </MobileSelectTrigger>
            <MobileSelectContent>
              {filteredGroups.map((g) => (
                <MobileSelectItem key={g.id} value={g.id}>
                  {g.label}
                  {dirtyGroupsLive.has(g.id) ? " ●" : ""}
                </MobileSelectItem>
              ))}
            </MobileSelectContent>
          </MobileSelect>
        </div>

        {/* Tablet chip strip */}
        <div className="hidden md:flex lg:hidden gap-2 overflow-x-auto pb-3 mb-4 -mx-4 px-4">
          {filteredGroups.map((g) => {
            const Icon = g.icon;
            const isActive = g.id === activeGroup.id;
            const dirty = dirtyGroupsLive.has(g.id);
            return (
              <button
                key={g.id}
                onClick={() => setActiveTab(g.id)}
                className={`shrink-0 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background border-border hover:bg-muted"
                }`}
                aria-label={`${g.label}${dirty ? " (edited)" : ""}`}
              >
                <Icon className="w-4 h-4" aria-hidden="true" focusable="false" />
                {g.label}
                {dirty && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-primary-foreground" : "bg-primary"}`}
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
          {/* Desktop vertical rail */}
          <aside className="hidden lg:block">
            <div className="sticky top-[220px]">
              <nav aria-label="Configuration groups" className="space-y-1">
                {filteredGroups.length === 0 && (
                  <p className="text-sm text-muted-foreground px-3 py-4">
                    No matching groups.
                  </p>
                )}
                {filteredGroups.map((g) => {
                  const Icon = g.icon;
                  const isActive = g.id === activeGroup.id;
                  const dirty = dirtyGroupsLive.has(g.id);
                  return (
                    <button
                      key={g.id}
                      onClick={() => setActiveTab(g.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left border-l-2 ${
                        isActive
                          ? "bg-primary/10 text-primary border-primary"
                          : "border-transparent text-foreground hover:bg-muted"
                      }`}
                      aria-current={isActive ? "page" : undefined}
                      aria-label={`${g.label}${dirty ? " (edited)" : ""}`}
                    >
                      <Icon className="w-4 h-4 shrink-0" aria-hidden="true" focusable="false" />
                      <span className="flex-1 truncate">{highlight(g.label, search)}</span>
                      {dirty && (
                        <span
                          className="w-2 h-2 rounded-full bg-primary shrink-0"
                          aria-hidden="true"
                        />
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Right panel */}
          <section aria-labelledby="active-group-heading">
            <div className="rounded-xl border border-border bg-card p-6 md:p-8">
              <div className="flex items-start justify-between gap-4 mb-6 pb-6 border-b border-border">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <activeGroup.icon
                      className="w-5 h-5 text-primary"
                      aria-hidden="true"
                      focusable="false"
                    />
                  </div>
                  <div className="min-w-0">
                    <h2
                      id="active-group-heading"
                      className="text-xl font-semibold text-foreground"
                    >
                      {activeGroup.label}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      {activeGroup.description}
                    </p>
                  </div>
                </div>
                {dirtyGroupsLive.has(activeGroup.id) && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary shrink-0 mt-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" aria-hidden="true" />
                    Edited
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                {activeGroup.fields.map((field) => renderField(activeGroup.id, field))}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default CustomerConfiguration;
