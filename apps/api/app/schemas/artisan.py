from pydantic import BaseModel


class ArtisanSchema(BaseModel):
    id: str
    slug: str
    name: str
    title: str
    location: str
    bio: str
    specialty: list[str]
    yearsExperience: int
    quote: str

    model_config = {"from_attributes": True}
