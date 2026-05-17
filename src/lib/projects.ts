export interface Project {
  id: string
  projectName: string
  startDate: string
  endDate: string
  hourlyRate: number
  company: string
  companyId: string
}

export interface ProjectFormValues {
  projectName: string
  startDate: string
  endDate: string
  hourlyRate: number
  company: string
  companyId: string
}

export interface ProjectRow {
  id: string
  project_name: string
  start_date: string | null
  end_date: string | null
  hourly_rate: number | string | null
  company_id: string
  company?: CompanyRelation
  companies?: CompanyRelation
}

type CompanyRelation =
  | {
      name?: string | null
    }
  | Array<{
      name?: string | null
    }>
  | null

export interface ProjectMutation {
  project_name: string
  start_date: string | null
  end_date: string | null
  hourly_rate: number
  company_id: string
}

export function emptyProjectForm(): ProjectFormValues {
  return {
    projectName: "",
    startDate: "",
    endDate: "",
    hourlyRate: 0,
    company: "",
    companyId: "",
  }
}

export function toProject(
  row: ProjectRow,
  companyNameById: Map<string, string> = new Map(),
): Project {
  return {
    id: row.id,
    projectName: row.project_name,
    startDate: row.start_date ?? "",
    endDate: row.end_date ?? "",
    hourlyRate: Number(row.hourly_rate ?? 0),
    company: getCompanyName(row) || companyNameById.get(row.company_id) || "",
    companyId: row.company_id,
  }
}

export function toProjectMutation(
  project: ProjectFormValues,
): ProjectMutation | null {
  const projectName = project.projectName.trim()

  if (!projectName || !project.companyId) {
    return null
  }

  return {
    project_name: projectName,
    start_date: project.startDate || null,
    end_date: project.endDate || null,
    hourly_rate: project.hourlyRate,
    company_id: project.companyId,
  }
}

function getCompanyName(row: Pick<ProjectRow, "company" | "companies">): string {
  return getRelationName(row.company) || getRelationName(row.companies)
}

function getRelationName(relation: CompanyRelation): string {
  if (!relation) return ""

  if (Array.isArray(relation)) {
    return relation[0]?.name ?? ""
  }

  return relation.name ?? ""
}
