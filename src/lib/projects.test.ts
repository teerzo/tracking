import { describe, expect, it } from "vitest"
import type { ProjectRow } from "@/lib/projects"
import { toProject, toProjectMutation } from "@/lib/projects"

describe("project helpers", () => {
  it("maps a Supabase project row with joined company data", () => {
    const row: ProjectRow = {
      id: "project-1",
      project_name: "Website",
      start_date: "2026-05-01",
      end_date: null,
      hourly_rate: "125.50",
      company_id: "company-1",
      company: { name: "Acme" },
    }

    expect(toProject(row)).toEqual({
      id: "project-1",
      projectName: "Website",
      startDate: "2026-05-01",
      endDate: "",
      hourlyRate: 125.5,
      company: "Acme",
      companyId: "company-1",
    })
  })

  it("falls back to a company name map when the row was not joined", () => {
    const row: ProjectRow = {
      id: "project-1",
      project_name: "Website",
      start_date: null,
      end_date: null,
      hourly_rate: 100,
      company_id: "company-1",
    }

    expect(toProject(row, new Map([["company-1", "Acme"]])).company).toBe(
      "Acme",
    )
  })

  it("builds a Supabase mutation using company_id", () => {
    expect(
      toProjectMutation({
        projectName: "  Website  ",
        startDate: "",
        endDate: "2026-06-30",
        hourlyRate: 125,
        company: "Acme",
        companyId: "company-1",
      }),
    ).toEqual({
      project_name: "Website",
      start_date: null,
      end_date: "2026-06-30",
      hourly_rate: 125,
      company_id: "company-1",
    })
  })

  it("does not build a mutation without required fields", () => {
    expect(
      toProjectMutation({
        projectName: "Website",
        startDate: "",
        endDate: "",
        hourlyRate: 125,
        company: "",
        companyId: "",
      }),
    ).toBeNull()
  })
})
