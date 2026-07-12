from pydantic import BaseModel


class CategorySchema(BaseModel):
    id: str
    slug: str
    name: str
    description: str | None = None
    imageUrl: str | None = None

    model_config = {"from_attributes": True}
