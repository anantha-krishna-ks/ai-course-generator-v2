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
  ChevronLeft,
  ChevronRight,
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
  "text-base font-semibold text-foreground mb-2 block";

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
      { id: "azureConnectionName", label: "Connection Name", type: "text", defaultValue: "courseed-azure" },
      { id: "azureContainerName", label: "Container Name", type: "text", defaultValue: "course-assets" },
    ],
  },
  {
    id: "crypto",
    label: "Encryption Algorithm",
    icon: KeyRound,
    description: "Encryption and hashing configuration.",
    fields: [
      {
        id: "encryptionAlgorithm",
        label: "Encryption Algorithm",
        type: "select",
        defaultValue: "AES256",
        options: [
          { value: "AES256", label: "AES-256" },
          { value: "AES128", label: "AES-128" },
          { value: "DES", label: "DES" },
        ],
      },
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
      { id: "iv", label: "IV", type: "secret", defaultValue: "1234567890abcdef" },
      { id: "key", label: "Key", type: "secret", defaultValue: "supersecretkey123" },
    ],
  },
  {
    id: "mail",
    label: "Mail Settings",
    icon: Mail,
    description: "Outbound email provider and SMTP configuration.",
    fields: [
      { id: "displayName", label: "Display Name", type: "text", defaultValue: "CourseED Notifications" },
      { id: "emailId", label: "EMail Id", type: "text", defaultValue: "noreply@example.com" },
      {
        id: "emailProvider",
        label: "EMail Provider",
        type: "select",
        defaultValue: "SMTP",
        options: [
          { value: "SMTP", label: "SMTP" },
          { value: "SENDGRID", label: "SendGrid" },
          { value: "SES", label: "AWS SES" },
        ],
      },
      { id: "enableSsl", label: "Enable SSL", type: "boolean", defaultValue: true },
      { id: "host", label: "Host", type: "text", defaultValue: "smtp.office365.com" },
      { id: "password", label: "Password", type: "secret", defaultValue: "examplepass" },
      { id: "port", label: "Port", type: "number", defaultValue: "587" },
    ],
  },
  {
    id: "file",
    label: "File Config",
    icon: FolderCog,
    description: "File storage credentials and target container.",
    fields: [
      { id: "accessKey", label: "Access Key", type: "secret", defaultValue: "AKIAEXAMPLE" },
      { id: "bucketName", label: "Bucket Name", type: "text", defaultValue: "courseed-prod" },
      { id: "fileConnectionName", label: "Connection Name", type: "text", defaultValue: "courseed-files" },
      { id: "fileContainerName", label: "Container Name", type: "text", defaultValue: "course-uploads" },
      { id: "region", label: "Region", type: "text", defaultValue: "us-east-1" },
      { id: "fileSecretKey", label: "Secret Key", type: "secret", defaultValue: "filesecretexample" },
    ],
  },
  {
    id: "courseed",
    label: "CourseED Settings",
    icon: Settings2,
    description: "Core CourseED platform behaviour and providers.",
    fields: [
      { id: "appCode", label: "App Code", type: "text", defaultValue: "COURSEED" },
      {
        id: "authenticationType",
        label: "Authentication Type",
        type: "select",
        defaultValue: "JWT",
        options: [
          { value: "JWT", label: "JWT" },
          { value: "OAUTH", label: "OAuth" },
          { value: "SAML", label: "SAML" },
        ],
      },
      {
        id: "dbProvider",
        label: "DBProvider",
        type: "select",
        defaultValue: "MONGO",
        options: [
          { value: "MONGO", label: "MongoDB" },
          { value: "POSTGRES", label: "PostgreSQL" },
          { value: "MYSQL", label: "MySQL" },
        ],
      },
      { id: "enableVectorSearch", label: "Enable Vector Search", type: "boolean", defaultValue: true },
      { id: "externalAuthUrl", label: "External Auth Url", type: "url", defaultValue: "https://auth.example.com" },
      {
        id: "imageProvider",
        label: "Image Provider",
        type: "select",
        defaultValue: "AZURE_OPENAI",
        options: [
          { value: "AZURE_OPENAI", label: "Azure OpenAI" },
          { value: "GEMINI", label: "Gemini" },
          { value: "DALLE", label: "DALL·E" },
        ],
      },
      {
        id: "llmProvider",
        label: "LLMProvider",
        type: "select",
        defaultValue: "AZURE_OPENAI",
        options: [
          { value: "AZURE_OPENAI", label: "Azure OpenAI" },
          { value: "GEMINI", label: "Gemini" },
          { value: "OPENAI", label: "OpenAI" },
        ],
      },
      {
        id: "promptProvider",
        label: "Prompt Provider",
        type: "select",
        defaultValue: "INTERNAL",
        options: [
          { value: "INTERNAL", label: "Internal" },
          { value: "LANGCHAIN", label: "LangChain" },
        ],
      },
      {
        id: "uploadSource",
        label: "Upload Source",
        type: "select",
        defaultValue: "AZURE",
        options: [
          { value: "AZURE", label: "Azure" },
          { value: "AWS", label: "AWS" },
          { value: "LOCAL", label: "Local" },
        ],
      },
      {
        id: "vectorDbProvider",
        label: "Vector DBProvider",
        type: "select",
        defaultValue: "PINECONE",
        options: [
          { value: "PINECONE", label: "Pinecone" },
          { value: "WEAVIATE", label: "Weaviate" },
          { value: "QDRANT", label: "Qdrant" },
        ],
      },
    ],
  },
  {
    id: "video",
    label: "Video Settings",
    icon: Video,
    description: "Video generation provider configuration.",
    fields: [
      { id: "clientSecretId", label: "Client Secret Id", type: "secret", defaultValue: "client-secret-xxxxxx" },
      { id: "jobStatusCallback", label: "Job Status Callback", type: "url", defaultValue: "https://example.com/callback/job" },
      { id: "pictoryApiUrl", label: "Pictory APIURL", type: "url", defaultValue: "https://api.pictory.ai/v1" },
      { id: "rendorVideoCallback", label: "Rendor Video Callback", type: "url", defaultValue: "https://example.com/callback/video" },
      { id: "xPictoryCustomerId", label: "XPictory Customer Id", type: "text", defaultValue: "cust-xxxxxx" },
    ],
  },
  {
    id: "azureopenai",
    label: "Azure OpenAI",
    icon: Brain,
    description: "Azure OpenAI service endpoints and deployment names.",
    fields: [
      { id: "chatDeploymentId", label: "Chat Deployment Id", type: "text", defaultValue: "gpt-4o" },
      { id: "chatEndpoint", label: "Chat Endpoint", type: "url", defaultValue: "https://example.openai.azure.com/" },
      { id: "chatKey", label: "Chat Key", type: "secret", defaultValue: "chat-key-xxxxxx" },
      { id: "contentTemperature", label: "Content Temperature", type: "number", defaultValue: "0.7" },
      { id: "embeddingDeploymentId", label: "Embedding Deployment Id", type: "text", defaultValue: "text-embedding-3-large" },
      { id: "embeddingEndpoint", label: "Embedding Endpoint", type: "url", defaultValue: "https://example.openai.azure.com/" },
      { id: "embeddingKey", label: "Embedding Key", type: "secret", defaultValue: "embed-key-xxxxxx" },
      { id: "imageDeploymentId", label: "Image Deployment Id", type: "text", defaultValue: "dall-e-3" },
      { id: "imageEndpoint", label: "Image Endpoint", type: "url", defaultValue: "https://example.openai.azure.com/" },
      { id: "imageKey", label: "Image Key", type: "secret", defaultValue: "image-key-xxxxxx" },
      { id: "questionCount", label: "Question Count", type: "number", defaultValue: "10" },
    ],
  },
  {
    id: "gemini",
    label: "Gemini Settings",
    icon: Sparkles,
    description: "Google Gemini API configuration.",
    fields: [
      { id: "geminiImageDeploymentId", label: "Image Deployment Id", type: "text", defaultValue: "imagen-3" },
      { id: "geminiImageKey", label: "Image Key", type: "secret", defaultValue: "gemini-image-key-xxxxxx" },
    ],
  },
  {
    id: "aws",
    label: "AWS Settings",
    icon: Cloud,
    description: "AWS storage credentials and region.",
    fields: [
      { id: "awsContainerName", label: "Container Name", type: "text", defaultValue: "courseed-prod" },
      { id: "awsRegionEndPoint", label: "Region End Point", type: "url", defaultValue: "https://s3.us-east-1.amazonaws.com" },
      { id: "storageAccountKey", label: "Storage Account Key", type: "secret", defaultValue: "AKIAEXAMPLE" },
      { id: "storageAccountName", label: "Storage Account Name", type: "text", defaultValue: "courseedstorage" },
      { id: "storageSecret", label: "Storage Secret", type: "secret", defaultValue: "awssecretexample" },
    ],
  },
  {
    id: "vector",
    label: "Vector DB",
    icon: Layers,
    description: "Vector search configuration for semantic retrieval.",
    fields: [
      { id: "vectorApiKey", label: "Api Key", type: "secret", defaultValue: "vec-key-xxxxxx" },
      { id: "chunkBatch", label: "Chunk Batch", type: "number", defaultValue: "32" },
      { id: "chunkOverlap", label: "Chunk Overlap", type: "number", defaultValue: "100" },
      { id: "chunkSize", label: "Chunk Size", type: "number", defaultValue: "1000" },
      { id: "vectorUrl", label: "Url", type: "url", defaultValue: "https://example.svc.pinecone.io" },
      { id: "gRpcPort", label: "G RPCPort", type: "number", defaultValue: "6334" },
    ],
  },
  {
    id: "timezone",
    label: "Time Zone",
    icon: Clock,
    description: "Default time zone and date/time formatting.",
    fields: [
      {
        id: "dateFormat",
        label: "Date Format",
        type: "select",
        defaultValue: "DD/MM/YYYY",
        options: [
          { value: "DD/MM/YYYY", label: "DD/MM/YYYY" },
          { value: "MM/DD/YYYY", label: "MM/DD/YYYY" },
          { value: "YYYY-MM-DD", label: "YYYY-MM-DD" },
        ],
      },
      {
        id: "timeFormat",
        label: "Time Format",
        type: "select",
        defaultValue: "24h",
        options: [
          { value: "24h", label: "24-hour" },
          { value: "12h", label: "12-hour" },
        ],
      },
      {
        id: "timezone",
        label: "Timezone",
        type: "select",
        defaultValue: "Asia/Kolkata",
        options: [
          { value: "Asia/Kolkata", label: "Asia/Kolkata (IST)" },
          { value: "UTC", label: "UTC" },
          { value: "America/New_York", label: "America/New_York" },
          { value: "Europe/London", label: "Europe/London" },
        ],
      },
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
  const [initial, setInitial] = useState<FormState>(() => buildInitialState());
  const [values, setValues] = useState<FormState>(() => buildInitialState());
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

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
    if (dirtyGroupsLive.size === 0) {
      toast({ title: "No changes to save" });
      return;
    }
    toast({
      title: "Configuration saved",
      description: `${dirtyGroupsLive.size} group(s) updated successfully.`,
    });
    setInitial(structuredClone(values));
  };

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
    <div className="relative min-h-screen bg-background overflow-hidden">
      <Header />
      <main className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/customers")}
          className="mb-6 rounded-full hover:bg-primary/5 hover:text-primary"
        >
          <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" focusable="false" />
          Back to Customers
        </Button>

        {/* Hero / Welcome banner */}
        <div className="mb-6">
          <div className="relative overflow-hidden rounded-2xl bg-card border border-border/60 px-7 py-6">
            <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <Settings2 className="w-5 h-5 text-primary" aria-hidden="true" focusable="false" />
                </div>
                <div className="min-w-0">
                  <h1
                    className="text-[26px] font-semibold tracking-[-0.03em] leading-tight text-foreground truncate"
                    style={{ fontFamily: "'Geist', sans-serif" }}
                  >
                    Customer configuration {customer ? `– ${customer.name}` : ""}
                  </h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    Manage connection, security, AI and integration settings for this customer
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-background rounded-full px-4 py-2 border border-border/60 self-start lg:self-auto">
                <div className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
                  <Layers className="w-3.5 h-3.5 text-primary" aria-hidden="true" focusable="false" />
                  <span>
                    <span className="font-semibold text-foreground">{configGroups.length}</span> groups
                  </span>
                </div>
                <span className="w-px h-3.5 bg-border" aria-hidden="true" />
                <div className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
                  <Settings2 className="w-3.5 h-3.5 text-primary" aria-hidden="true" focusable="false" />
                  <span>
                    <span className="font-semibold text-foreground">{totalFields}</span> fields
                  </span>
                </div>
                {isDirty && (
                  <>
                    <span className="w-px h-3.5 bg-border" aria-hidden="true" />
                    <div className="flex items-center gap-1.5 text-[13px] text-primary font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" aria-hidden="true" />
                      <span>{dirtyGroupsLive.size} unsaved</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sticky toolbar: search + save */}
        <div className="sticky top-16 z-20 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 bg-background/85 backdrop-blur-md border-b border-border mb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <div className="relative w-full md:w-72 shrink-0">
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
                className="pl-9 h-9 rounded-full bg-card"
                aria-label="Search settings"
              />
            </div>
            <div className="flex-1" aria-hidden="true" />
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
            <div className="sticky top-[140px]">
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

              {/* Back / Next navigation */}
              {(() => {
                const navList = filteredGroups.length > 0 ? filteredGroups : configGroups;
                const currentIdx = navList.findIndex((g) => g.id === activeGroup.id);
                const prevGroup = currentIdx > 0 ? navList[currentIdx - 1] : null;
                const nextGroup =
                  currentIdx >= 0 && currentIdx < navList.length - 1
                    ? navList[currentIdx + 1]
                    : null;
                return (
                  <div className="mt-8 pt-6 border-t border-border flex items-center justify-between gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        if (prevGroup) {
                          setActiveTab(prevGroup.id);
                        }
                      }}
                      disabled={!prevGroup}
                      aria-label={
                        prevGroup ? `Back to ${prevGroup.label}` : "No previous section"
                      }
                      className="gap-2"
                    >
                      <ChevronLeft className="w-4 h-4" aria-hidden="true" focusable="false" />
                      <span className="hidden sm:inline">Back</span>
                      {prevGroup && (
                        <span className="hidden md:inline text-muted-foreground font-normal">
                          · {prevGroup.label}
                        </span>
                      )}
                    </Button>

                    <span className="text-xs text-muted-foreground" aria-live="polite">
                      {currentIdx + 1} of {navList.length}
                    </span>

                    <Button
                      type="button"
                      onClick={() => {
                        if (nextGroup) {
                          setActiveTab(nextGroup.id);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }
                      }}
                      disabled={!nextGroup}
                      aria-label={nextGroup ? `Next: ${nextGroup.label}` : "No next section"}
                      className="gap-2"
                    >
                      {nextGroup && (
                        <span className="hidden md:inline font-normal opacity-90">
                          {nextGroup.label} ·
                        </span>
                      )}
                      <span className="hidden sm:inline">Next</span>
                      <ChevronRight className="w-4 h-4" aria-hidden="true" focusable="false" />
                    </Button>
                  </div>
                );
              })()}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default CustomerConfiguration;
